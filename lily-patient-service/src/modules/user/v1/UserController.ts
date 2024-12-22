"use strict";
import * as _ from "lodash";
import * as crypto from "crypto";
import * as promise from "bluebird";
import {
  buildToken,
  encryptHashPassword,
  getRandomOtp,
  getLocationByIp,
  matchPassword,
  matchOTP,
  encryptData,
  decryptData,
  genRandomString,
  toObjectId,
  passwordGenrator,
  toMongooseObjectId,
} from "@utils/appUtils";
import {
  JOB_SCHEDULER_TYPE,
  STATUS,
  TOKEN_TYPE,
  SERVER,
  USER_TYPE,
  MESSAGES,
  ENVIRONMENT,
  OTP_BODY,
} from "@config/index";
import * as userConstant from "@modules/user/v1/userConstant";
import { userDaoV1 } from "@modules/user/index";
import { baseDao } from "@modules/baseDao/index";
import { loginHistoryDao } from "@modules/loginHistory/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { validate } from "@lib/tokenManager";
import { logger } from "@lib/logger";
import { axiosService } from "@lib/axiosService";
import { changeProfile, forgotPassword, patient, patientLogin, sendOtp, resetPassword, signUp, userLogin, verifyOtp, contactUs, generateToken, sentInvite, getUserProfile, editPatient, device } from "./routeValidator";
import { encryptedDb } from "@utils/DatabaseClient";
import { DASHBOARD_TYPE, NOTIFICATION_TYPE, OTP_TYPE } from "@modules/user/v1/userConstant";
import { epic } from "@lib/epic";
import { notificationDaoV1 } from "@modules/notification";
import { mealDaoV1 } from "@modules/meal";

export class UserController {
  /**
   * @function removeSession
   * @description remove the user session
   * @param params.userId
   * @param params.deviceId
   * @returns
   */
  async removeSession(params, isSingleSession: boolean) {
    try {
      if (isSingleSession)
        await loginHistoryDao.removeDeviceById({ userId: params.userId });
      else
        await loginHistoryDao.removeDeviceById({ userId: params.userId, deviceId: params.deviceId });

      if (SERVER.IS_REDIS_ENABLE) {
        if (isSingleSession) {
          let keys: any = await redisClient.getKeys(`*${params.userId}*`);
          keys = keys.filter(
            (v1) =>
              Object.values(JOB_SCHEDULER_TYPE).findIndex(
                (v2) => v2 === v1.split(".")[0]
              ) === -1
          );
          if (keys.length) await redisClient.deleteKey(keys);
        } else
          await redisClient.deleteKey(`${params.userId}.${params.deviceId}`);
      }
    } catch (error) {
      logger.error(error.stack);
      sendMessageToFlock({ title: "_removeSession", error: error.stack });
    }
  }

  /**
   * @function updateUserDataInRedis
   * @description update user's data in redis
   * @param params.salt
   * @param params.userId
   * @returns
   */
  async updateUserDataInRedis(params, isAlreadySaved = false) {
    try {
      delete params.salt;
      if (SERVER.IS_REDIS_ENABLE) {
        let keys: any = await redisClient.getKeys(
          `*${params.userId || params._id.toString()}*`
        );
        keys = keys.filter(
          (v1) =>
            Object.values(JOB_SCHEDULER_TYPE).findIndex(
              (v2) => v2 === v1.split(".")[0]
            ) === -1
        );
        const promiseResult = [],
          array = [];
        for (const key of keys) {
          if (isAlreadySaved) {
            let userData: any = await redisClient.getValue(
              `${params.userId || params._id.toString()}.${key.split(".")[1]}`
            );
            array.push(key);
            array.push(
              JSON.stringify(buildToken(_.extend(JSON.parse(userData), params)))
            );
            promiseResult.push(userData);
          } else {
            array.push(key);
            array.push(JSON.stringify(buildToken(params)));
          }
        }

        await Promise.all(promiseResult);
        if (array.length) redisClient.mset(array);
      }
      return {};
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updateUserDataInDb
   * @description update user's data in login history
   * @param params._id
   * @returns
   */
  async updateUserDataInDb(params) {
    try {
      await baseDao.updateMany(
        "login_histories",
        { "userId._id": params._id },
        { $set: { userId: params } },
        {}
      );
      return {};
    } catch (error) {
      logger.error(error.stack);
      throw error;
    }
  }

  /**
   * @function sendOTP
   * @description send/resend otp on email/number
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required)
   * @param params.type otp type (required)
   * @returns
   */
  async sendOTP(payload: UserRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.SendOtp = JSON.parse(decryptedData);
      const validation = sendOtp.validate(params);
      if (validation.error) return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));

      const isExist = await userDaoV1.isEmailExists(params);
      if (!isExist) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (isExist.status === STATUS.INACTIVE) return Promise.reject(MESSAGES.ERROR.BLOCKED);

      let fullMobileNo = params?.countryCode + params?.mobileNo;

      const environment: Array<string> = [ENVIRONMENT.PRODUCTION, ENVIRONMENT.DEV, ENVIRONMENT.PREPROD, ENVIRONMENT.STAGING];
      const otp_count: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${params.email}.${params.type}`
      );

      if (otp_count && JSON.parse(otp_count).count > SERVER.OTP_LIMIT) return Promise.reject(userConstant.MESSAGES.ERROR.LIMIT_EXCEEDS); //NOSONAR

      if (environment.includes(SERVER.ENVIRONMENT)) {
        await this.handleOTP(params, isExist, fullMobileNo, otp_count);
      } else {
        redisClient.setExp(`${params.email}.${params.type}`,SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,JSON.stringify({ email: params.email,otp: SERVER.DEFAULT_OTP }));
      }
      return userConstant.MESSAGES.SUCCESS.SEND_OTP;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @description handleOTP
   * @description this function is used to handle the otp while sending otp
   */
  private async handleOTP(params: UserRequest.SendOtp, isExist: any, fullMobileNo: string, otp_count: any) {
    const otp = getRandomOtp(4).toString();
  
    if (params.type === OTP_TYPE.VERIFY_MAIL || params.type === OTP_TYPE.FORGOT_PASSWORD) {
      redisClient.setExp(
        `${params.email}.${params.type}`,
        SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
        JSON.stringify({ email: params.email, otp: otp })
      );
    }
  
    if (params.type === OTP_TYPE.VERIFY_MOBILE_NO) {
      redisClient.setExp(
        `${params.email}.${params.type}`,
        SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
        JSON.stringify({ mobileNo: fullMobileNo, otp: otp })
      );
    }
  
    await this.sendOTPEmail(params, isExist, fullMobileNo, otp);
  
    redisClient.setExp(
      `${SERVER.APP_NAME}.${params.email}.${params.type}`,
      SERVER.TOKEN_INFO.EXPIRATION_TIME.OTP_LIMIT / 1000,
      JSON.stringify({ email: params.email, count: JSON.parse(otp_count) ? JSON.parse(otp_count).count + 1 : 1 })
    );
  }
  
  /**
   * @function sendOTPEmail
   * @description this function is use to send otp on the basis of type
   */
  private async sendOTPEmail(params: UserRequest.SendOtp, isExist: any, fullMobileNo:string, otp: string) {
    if (params.type === OTP_TYPE.VERIFY_MAIL) {
      let mailData = {
        type: userConstant.MAIL_TYPE.VERIFY_EMAIL,
        email: isExist.email,
        otp: otp,
        name: isExist.fullName,
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
    } else if (params.type === OTP_TYPE.FORGOT_PASSWORD) {
      let mailData = {
        type: userConstant.MAIL_TYPE.FORGOT_PASSWORD,
        email: isExist.email,
        otp: otp,
        name: isExist.fullName,
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
    }else if(params.type === OTP_TYPE.VERIFY_MOBILE_NO){
      let messageData = {
        to: fullMobileNo,
        body: OTP_BODY.VERIFY_MOBILE + otp
      }
      messageData = encryptData(JSON.stringify(messageData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MESSAGE, "body": { data: messageData }});
    }
  }

  /**
   * @function signUp
   * @description signup of participant/supporter
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.password: user's password (required)
   * @param params.fullName: user's fullName (required)
   * @returns users detail object
   */
  async signUp(payload: UserRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.SignUp = JSON.parse(decryptedData);
      const validation = signUp.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const isExist = await userDaoV1.isEmailExists(params);
      if (isExist) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);

      if (params.confirmPassword) {
        if (params.password != params.confirmPassword) {
          return userConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH;
        }
      }
      const environment: Array<string> = [ENVIRONMENT.PRODUCTION, ENVIRONMENT.DEV, ENVIRONMENT.PREPROD, ENVIRONMENT.LOCAL, ENVIRONMENT.STAGING];

      if (environment.includes(SERVER.ENVIRONMENT)) {
        const otp = getRandomOtp(4).toString();

        redisClient.setExp(
          `${params.email}.${OTP_TYPE.VERIFY_MAIL}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
          JSON.stringify({ email: params.email, otp: otp })
        );

        let mailData = {
          type: userConstant.MAIL_TYPE.VERIFY_EMAIL,
          email: params.email,
          otp: otp,
          name: params.fullName,
        }
        mailData = encryptData(JSON.stringify(mailData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${SERVER.APP_NAME}.${params.email}.${OTP_TYPE.VERIFY_MAIL}`,
            SERVER.TOKEN_INFO.EXPIRATION_TIME.OTP_LIMIT / 1000,
            JSON.stringify({
              email: params.email,
              count: 1,
            })
          );
      } else {
        if (SERVER.IS_REDIS_ENABLE) // NOSONAR
          redisClient.setExp(
            `${params.email}.${OTP_TYPE.VERIFY_MAIL}`,
            SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
            JSON.stringify({
              email: params.email,
              otp: SERVER.DEFAULT_OTP,
            })
          );
      }

      const salt = genRandomString(SERVER.SALT_ROUNDS);
      const userData = {
        email: params.email,
        fullName: params.fullName,
        salt: salt,
        hash: encryptHashPassword(params.password, salt),
        language: userConstant.LANGUAGE.ENGLISH,
        status: STATUS.PENDING,
        userType: USER_TYPE.USER,
        rpm: 0,
        ppg: 0,
        fpg: 0,
        isGlucoseAdded: false,
        isEmailVerified: false,
        isHealthAppConnected: false
      }
      const step1 = await userDaoV1.signUp(userData);
      let data = {
        userId: step1.insertedId,
        email: params.email,
      }
      data = encryptData(JSON.stringify(data));
      let dashboard = {
        type: DASHBOARD_TYPE.PATIENT,
      }
      dashboard = encryptData(JSON.stringify(dashboard));
      axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": {data: dashboard} });
      return userConstant.MESSAGES.SUCCESS.SIGNUP(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }


  /**
   * @function verifyOTP
   * @description verify otp on signUp
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.otp: otp (required)
   * @param params.deviceId
   * @param params.deviceToken
   * @returns accessToken and data obj
   */
  async verifyOTP(payload: UserRequest.Payload, headers: any, remoteAddress: string) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.VerifyOTP = JSON.parse(decryptedData);
      const validation = verifyOtp.validate(params);
      if (validation.error) return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));

      const step1 = await userDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status == STATUS.INACTIVE) return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED);

      const step2 = await redisClient.getValue(`${params.email}.${params.type}`);

      let isOTPMatched = await matchOTP(params.otp, step2);
      const environment: Array<string> = [ENVIRONMENT.DEV, ENVIRONMENT.LOCAL, ENVIRONMENT.STAGING, ENVIRONMENT.PREPROD];
      if (environment.includes(SERVER.ENVIRONMENT) && params.otp == SERVER.BYPASS_OTP) isOTPMatched = true;

      if (!isOTPMatched) return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_OTP);

      if (params.type === OTP_TYPE.VERIFY_MOBILE_NO) {
        params.fullMobileNo = params.countryCode + params.mobileNo;
        return await this.verifyMobileOTP(params, step1); // verify the mobile number otp
      }
      else if (params.type === OTP_TYPE.FORGOT_PASSWORD) {
        return await this.verifyOtpForgotPassword(params, step1);
      }
      else {
        if (step1.status === STATUS.PENDING) step1.status = STATUS.ACTIVE
        params.remoteAddress = remoteAddress;
        return await this.verifyMailOtp(params, step1, headers);
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function login
   * @description signup of participant/supporter
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.password: user's password (required)
   * @param params.deviceId: device id (required)
   * @param params.deviceToken: device token (required)
   * @retuns data obj with token
   */
  async login(payload: UserRequest.Payload, headers: any, remoteAddress: string) {
    try {
      const userCollection = encryptedDb.getUserEncryptedClient();
      const providerCollection = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.Login = JSON.parse(decryptedData);
      const validation = patientLogin.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      params.remoteAddress = remoteAddress;
      const step1 = await userDaoV1.isCodeExist(params);
      if (!step1) return Promise.reject(userConstant.MESSAGES.ERROR.CODE_NOT_FOUND);
      if (step1.status === STATUS.INACTIVE)
        return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED);

      if (params.dob !== step1.dob)
        return Promise.reject(userConstant.MESSAGES.ERROR.INCORRECT_DOB);
      else {
        if (step1.status === STATUS.PENDING) step1.status = STATUS.ACTIVE
        await this.removeSession(
          { userId: step1._id, deviceId: params.deviceId },
          true
        );
        const salt = crypto.randomBytes(64).toString("hex");
        const tokenData = {
          userId: step1._id,
          deviceId: params.deviceId,
          accessTokenKey: salt,
          type: TOKEN_TYPE.USER_LOGIN,
          userType: step1.userType,
        };
        const encryptedTokenData = encryptData(JSON.stringify(tokenData));
        let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } });
        const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
        const [accessToken, refreshToken] = await promise.join(
          authToken.data.jwtToken, authToken.data.refreshToken,
          loginHistoryDao.createUserLoginHistory({ ...params, ...headers, ...step1, salt, location, })
        );
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${step1._id.toString()}.${params.deviceId}`,
            Math.floor(
              SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000
            ),
            JSON.stringify(buildToken({ ...step1, ...params, ...headers, salt }))
          );
        
        const clinicData = await userDaoV1.findOne(providerCollection, { clinicId: step1.clinicId, createdBy: USER_TYPE.ADMIN});
        step1._id.toString();
        let data = {
          accessToken,
          refreshToken,
          userId: step1._id,
          email: step1.email,
          userType: step1.userType,
          firstName: step1?.firstName,
          lastName: step1?.lastName,
          fullName: step1?.fullName,
          profilePicture: step1?.profilePicture,
          dob: step1?.dob,
          countryCode: step1?.countryCode,
          mobileNo: step1?.mobileNo,
          fullMobileNo: step1?.fullMobileNo,
          address: step1?.address,
          isEmailVerified: step1.isEmailVerified,
          isMobileVerified: step1.isMobileVerified,
          language: step1.language,
          clinicName: clinicData?.clinicName,
          clinicImage: clinicData?.profilePicture,
          deviceName: step1.device
        };
        if (!step1.isEmailVerified) {
          data.isMobileVerified = false;
        }

        userDaoV1.findOneAndUpdate(
          userCollection,
          { _id: step1._id },
          { refreshToken, lastLogin: Date.now(), status: STATUS.ACTIVE, platform: headers.platform }
        );
        data = encryptData(JSON.stringify(data));
        return userConstant.MESSAGES.SUCCESS.LOGIN(data);
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function forgotPassword
   * @description send OTP when user forgot password
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @returns
   */
  async forgotPassword(payload: UserRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.ForgotPassword = JSON.parse(decryptedData);
      const validation = forgotPassword.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const step1 = await userDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
      if (!step1) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      else if (step1.status === STATUS.INACTIVE)
        return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED);
      const otp_count: any = await redisClient.getValue(
        `${SERVER.APP_NAME}.${params.email}.${OTP_TYPE.FORGOT_PASSWORD}`
      );
      if (otp_count && JSON.parse(otp_count).count > 4)
        return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS);

      const otp = getRandomOtp(4).toString();

      redisClient.setExp(
        `${params.email}.${OTP_TYPE.FORGOT_PASSWORD}`,
        SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
        JSON.stringify({ email: params.email, otp: otp })
      );

      let mailData = {
        type: userConstant.MAIL_TYPE.FORGOT_PASSWORD,
        email: params.email,
        otp: otp,
        name: step1.fullName,
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      if (SERVER.IS_REDIS_ENABLE) {
        redisClient.setExp(
          `${SERVER.APP_NAME}.${params.email}.${OTP_TYPE.FORGOT_PASSWORD}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.LINK_LIMIT / 1000,
          JSON.stringify({
            email: params.email,
            count: JSON.parse(otp_count)
              ? JSON.parse(otp_count).count + 1
              : 1,
          })
        );
      }
      return userConstant.MESSAGES.SUCCESS.MAIL_SENT;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function resetPassword   
   * @description update user new password in DB
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.newPassword: new password
   * @param params.confirmPassword: confirmation of new password
   * @returns
   */
  async resetPassword(payload: UserRequest.Payload) {
    try {
      const collection = encryptedDb.getUserEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.ChangeForgotPassword = JSON.parse(decryptedData);
      const validation = resetPassword.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      if (params.newPassword !== params.confirmPassword)
        return Promise.reject(userConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH);
      const step1 = await userDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
      if (!step1) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      let salt; 
      if(step1.salt){
        salt = step1.salt;
      }
      else{
        salt = genRandomString(SERVER.SALT_ROUNDS);
        params.salt = salt;
      }
      params.hash = encryptHashPassword(params.newPassword, salt);
      if(step1.hash){
        if(step1.hash === params.hash) return Promise.reject(userConstant.MESSAGES.ERROR.SAME_PASSWORD);
      }
      await userDaoV1.changePassword(params);
      redisClient.deleteKey(`${SERVER.APP_NAME}.${params.email}.${OTP_TYPE.FORGOT_PASSWORD}`);
      await userDaoV1.findOneAndUpdate(
        collection,
        { _id: step1._id },
        { isEmailVerified: true }
      );
      return userConstant.MESSAGES.SUCCESS.RESET_PASSWORD;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function logout
   * @description remove/end the user session
   * @param tokenData.userId user's id (required)
   * @returns
   */
  async logout(tokenData: TokenData) {
    try {
      const userColl = encryptedDb.getUserEncryptedClient();
      await this.removeSession(tokenData, true);
      await userDaoV1.findOneAndUpdate(userColl, {_id: toObjectId(tokenData.userId)}, {isDeviceConnected: false});
      return userConstant.MESSAGES.SUCCESS.USER_LOGOUT;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

   /**
   * @function profile
   * @description user can get the profile details by userid
   * @param params.userId
   * @returns User's details obj
   */
   async profile(params: UserId, tokenData: TokenData, headers) {
    try {
      const offset = headers.offset ? headers.offset : 0;
      console.log('*************offset*********', offset);
      let data = await userDaoV1.getProfile(
        params?.userId || tokenData.userId, offset
      );
      if (!data) return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      data = encryptData(JSON.stringify(data));
      return userConstant.MESSAGES.SUCCESS.PROFILE(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function changeProfile
   * @description edit the patient profile
   * @params payload contains encrypted data : decrypted params defined below
   * @returns Updated data of user
   */
  async changeProfile(params: UserRequest.Payload, tokenData: TokenData) {
    try {
      let decryptedData = decryptData(params.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let payload: UserRequest.ChangeProfile = JSON.parse(decryptedData);
      const validation = changeProfile.validate(payload);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      if (payload.fullName === "") return Promise.reject(userConstant.MESSAGES.ERROR.EMPTY_NAME);
      const step1 = await userDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if (payload.countryCode && payload.mobileNo) {
        payload.fullMobileNo = payload.countryCode + payload.mobileNo;
      }
      let result = await userDaoV1.changeProfile(payload, tokenData.userId);
      if (!result) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG);
      let data = await userDaoV1.getProfile(result._id);
      data = encryptData(JSON.stringify(data));
      return userConstant.MESSAGES.SUCCESS.EDIT_PROFILE(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function createPatient
   * @description Create the provider
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required) 
   * @param params.clinicId clinic id (required)
   * @param params.name user's name (required)
   * @returns
   */
  async createPatient(payload: UserRequest.Payload, tokenData: TokenData) {
    try {
      const providerColl = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.CreatePatient = JSON.parse(decryptedData);
      const validation = patient.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      let isUserExists;
      if(params.email){
        isUserExists = await userDaoV1.isEmailExists(params);
        if (isUserExists && isUserExists.providerId && isUserExists.providerCode) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);//NOSONAR
      }

      if (params?.countryCode && params?.mobileNo) { //NOSONAR
        params.fullMobileNo = params?.countryCode + params?.mobileNo;
        const isMobileExists = await userDaoV1.isMobileExists(params);
        if(!isUserExists){
          isUserExists = isMobileExists;
        }
        if (isMobileExists && isMobileExists.providerId && isMobileExists.providerCode) return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);//NOSONAR
      }

      const clinicData = await userDaoV1.findOne(providerColl, { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN });

      const providerName = params.providerName;
      delete params.providerName;

      let otp = getRandomOtp(6).toString();
      params.status = STATUS.PENDING;
      params.userType = USER_TYPE.USER;
      params.fullName = params.firstName + " " + params.lastName;
      if (params?.countryCode && params?.mobileNo) {//NOSONAR
        params.fullMobileNo = params?.countryCode + params?.mobileNo;
        params.isMobileVerified = false;
      }
      params.rpm = 0;
      params.ppg = 0;
      params.fpg = 0;
      params.providerCode = otp;
      params.providerId = toObjectId(params.providerId);
      params.addedBy = toObjectId(tokenData.userId);
      params.isDeviceConnected = false;
      params.resendDate = Date.now();
      params.medicationDate = Date.now();
      params.isGlucoseAdded = false;
      params.isHealthAppConnected = false;
      if(!params.glucoseInterval){
        params.glucoseInterval = clinicData.glucoseInterval ? clinicData.glucoseInterval : 1;
      }
      if (isUserExists) {//NOSONAR
        let isEmail = true;
        params.status = STATUS.ACTIVE;
        await userDaoV1.updatePatient(params, isEmail);
      }
      else {//NOSONAR
        await userDaoV1.createPatient(params);
      }
      
      if (params.email) {//NOSONAR
        let mailData = {
          type: userConstant.MAIL_TYPE.WELCOME_MAIL,
          email: params.email,
          otp: otp,
          name: params.fullName,
          clinic_name: clinicData.clinicName,
          providerName: providerName,
          device: params.device
        }
        mailData = encryptData(JSON.stringify(mailData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData } });
      }
      if (params?.fullMobileNo) {
        let messageData;
        let body;
        if(params.device != userConstant.DEVICE.LIBRA_3){
          body = OTP_BODY.CREATE_PATIENT + otp + ` Connect your ${params.device}. Pairing instructions can be found here: ${SERVER.LIBRE_GUIDE_URL}`;
        }
        else if(params.device != userConstant.DEVICE.DEXCOM_G7){
          body = OTP_BODY.CREATE_PATIENT + otp + ` Connect your ${params.device}. Pairing instructions can be found here: ${SERVER.DEXCOM_GUIDE_URL}`;
        }
        else if(params.device != userConstant.DEVICE.ACCUCHEK){
          body = OTP_BODY.CREATE_PATIENT + otp + ` Connect your ${params.device}. Pairing instructions can be found here: ${SERVER.ACCUCHECK_GUIDE_URL}`;
        }
        if(params.device != userConstant.DEVICE.NA){
          const url = SERVER.LIBRE_GUIDE_URL;
          messageData = {
            to: params.fullMobileNo,
            body: body
          }
        }
        else{
          messageData = {
            to: params.fullMobileNo,
            body: OTP_BODY.CREATE_PATIENT + otp
          }
        }
        messageData = encryptData(JSON.stringify(messageData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MESSAGE, "body": { data: messageData } });
      }
      const count = clinicData.totalPaitents + 1;
      await userDaoV1.updateOne(
        providerColl,
        { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN },
        { totalPaitents: count }
      );
      let dashboard = {
        type: DASHBOARD_TYPE.PATIENT,
      }
      dashboard = encryptData(JSON.stringify(dashboard));
      axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": { data: dashboard } });
      setTimeout(() => {
        this.updatePatientEpicData(params);
      }, 60000);
      return userConstant.MESSAGES.SUCCESS.PATIENT_CREATED;
    }
    catch (error) {//NOSONAR
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updatePatientEpicData
   * @description update the epic data of patient
   * @param params 
   */
  async updatePatientEpicData(params: UserRequest.CreatePatient){
    const userColl = encryptedDb.getUserEncryptedClient();
    const epicData = await epic.getPatientData(params);
    if (epicData) {
      await userDaoV1.findOneAndUpdate(userColl, { email: params?.email, fullMobileNo: params?.fullMobileNo }, { epicId: epicData.patientId, weight: epicData.weightValue, height: epicData.heightValue, heightObservationId: epicData.heightObservationId, weightObservationId: epicData.weightObservationId });
    }
  }

  /**
   * @function getPatientListing
   * @description get the patient listing
   * @param params.pageNo page no (required)
   * @param params.limit limit (required)
   * @returns array of patients
   */
  async getPatientListing(params: UserRequest.PatientListing, tokenData: TokenData) {
    try {
      let data = await userDaoV1.getPatientListing(params);
      data = encryptData(JSON.stringify(data));
      return MESSAGES.SUCCESS.DETAILS(data);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function encrypt
   * @description Encrypt the request payload
   * @returns encrypted playload object
   */
  async encrypt(payload) {
    try {
      const data = encryptData(JSON.stringify(payload));
      return MESSAGES.SUCCESS.DETAILS(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function decrypt
   * @description Decrypt the encrypted data
   * @returns Decrypted data object 
   */
  async decrypt(payload: UserRequest.decrypt) {
    try {
      const decryptedData = decryptData(payload.data);
      const data = JSON.parse(decryptedData);
      return MESSAGES.SUCCESS.DETAILS(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function userLogin
   * @description Login User via email and password
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required)
   * @param params.password user's password (required)
   * @param params.deviceId device id (required)
   * @param params.deviceToken 
   * @returns user data object
   */
  async userLogin(payload: UserRequest.Payload, headers: any, remoteAddress: string) {
    try {
      const collection = encryptedDb.getUserEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.Login = JSON.parse(decryptedData);
      const validation = userLogin.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      params.remoteAddress = remoteAddress;
      const step1 = await userDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status === STATUS.INACTIVE)
        return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED);
      const isPasswordMatched = await matchPassword(params.password, step1.hash, step1.salt);
      if (!isPasswordMatched)
        return Promise.reject(userConstant.MESSAGES.ERROR.INCORRECT_PASSWORD);
      if (!step1?.isEmailVerified || step1?.isEmailVerified === false){
        let data = {
          email:params.email,
          type: OTP_TYPE.VERIFY_MAIL
        }
        const sendOtp = encryptData(JSON.stringify(data));
        await this.sendOTP({data:sendOtp})
        return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_NOT_VERIFIED);
      }
      else {
        if(step1?.status === STATUS.PENDING)step1.status = STATUS.ACTIVE
        await this.removeSession(
          { userId: step1._id, deviceId: params.deviceId },
          true
        );
        const salt = crypto.randomBytes(64).toString("hex");
        const tokenData = {
          userId: step1._id,
          deviceId: params.deviceId,
          accessTokenKey: salt,
          type: TOKEN_TYPE.USER_LOGIN,
          userType: step1.userType,
        };
        const encryptedTokenData = encryptData(JSON.stringify(tokenData));
        let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } });
        const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
        const [accessToken, refreshToken] = await promise.join(
          authToken.data.jwtToken, authToken.data.refreshToken,
          loginHistoryDao.createUserLoginHistory({ ...params, ...headers, ...step1, salt, location, })
        );
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${step1._id.toString()}.${params.deviceId}`,
            Math.floor(
              SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000
            ),
            JSON.stringify(buildToken({ ...step1, ...params, ...headers, salt }))
          );

        step1._id.toString();

        let data = {
          accessToken,
          refreshToken,
          userId: step1._id,
          email: step1.email,
          userType: step1.userType,
          fullName: step1?.fullName,
          countryCode: step1?.countryCode,
          mobileNo: step1?.mobileNo,
          fullMobileNo: step1?.fullMobileNo,
          status: step1?.status,
          language: step1?.language,
          isEmailVerified: step1.isEmailVerified,
          isMobileVerified: step1.isMobileVerified
        };

        if (!step1.isMobileVerified) {
          data.isMobileVerified = false;
        }

        userDaoV1.findOneAndUpdate(
          collection,
          { _id: step1._id },
          { refreshToken, lastLogin: Date.now(), status: STATUS.ACTIVE, platform: headers.platform }
        );
        data = encryptData(JSON.stringify(data));
        return userConstant.MESSAGES.SUCCESS.LOGIN(data);
      }
    }
    catch (error) {
      logger.error(error);
      throw error
    }
  }

  /**
   * @function verifyMobileOTP
   * @description verify the otp sent on mobile number
   * @param payload.mobileNo mobileNo (required)
   */
  async verifyMobileOTP(params: UserRequest.VerifyOTP, userData: any) {
    try {
      const collection = encryptedDb.getUserEncryptedClient();
      let dataToReturn = {};
      dataToReturn = {
        userId: userData._id,
        userType: userData.userType,
        fullName: userData?.fullName,
        fullMobileNo: params.fullMobileNo,
        isMobileVerified: true,
        isEmailVerified: userData.isEmailVerified
      };
      redisClient.deleteKey(`${SERVER.APP_NAME}.${params.email}.${params.type}`);
      dataToReturn = encryptData(JSON.stringify(dataToReturn));
      userDaoV1.findOneAndUpdate(
        collection,
        { _id: userData._id },
        { countryCode: params.countryCode, mobileNo: params.mobileNo, fullMobileNo: params.fullMobileNo, isMobileVerified: true }
      );
      return userConstant.MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function verifyMailOtp
   * @description verify forgot password otp through mail
   * @param params.email (required)
   * @param params.otp (required)
   */
  async verifyOtpForgotPassword(params: UserRequest.VerifyOTP, userData: any) {
    try {
      const dataToReturn = {
        userId: userData._id,
        email: userData?.email,
        fullName: userData.fullName,
        userType: userData.userType,
        isEmailVerified: userData.isEmailVerified,
        isMobileVerified: userData.isMobileVerified
      };
      if (!userData.isMobileVerified) {
        dataToReturn.isMobileVerified = false;
      }
      redisClient.deleteKey(`${SERVER.APP_NAME}.${params.email}.${params.type}`);
      redisClient.setExp(
        `${SERVER.APP_NAME}.${params.email}.${params.type}`,
        SERVER.TOKEN_INFO.EXPIRATION_TIME.OTP_LIMIT / 1000,
        JSON.stringify({ email: userData.email })
      );
      return userConstant.MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function verifyMailOtp
   * @description verify otp on mail after singup
   */
  async verifyMailOtp(params: UserRequest.VerifyOTP, step1: any, headers: any) {
    try {
      const collection = encryptedDb.getUserEncryptedClient();
      let dataToReturn = {};
      const salt = crypto.randomBytes(64).toString("hex");
      const tokenData = {
        userId: step1._id,
        deviceId: params.deviceId,
        accessTokenKey: salt,
        type: TOKEN_TYPE.USER_LOGIN,
        userType: step1.userType,
      };
      const encryptedTokenData = encryptData(JSON.stringify(tokenData));
      let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } })
      const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
      const [accessToken, refreshToken] = await promise.join(
        authToken.data.jwtToken, authToken.data.refreshToken,
        loginHistoryDao.createUserLoginHistory({ ...params, ...step1, ...headers, salt, location, })
      );
      if (SERVER.IS_REDIS_ENABLE)
        redisClient.setExp(
          `${step1._id.toString()}.${params.deviceId}`,
          Math.floor(
            SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000
          ),
          JSON.stringify(buildToken({ ...step1, ...params, ...headers, salt }))
        );

      dataToReturn = {
        accessToken,
        refreshToken,
        userId: step1._id,
        email: step1.email,
        userType: step1.userType,
        fullName: step1?.fullName,
        firstName: step1?.firstName,
        lastName: step1?.lastName,
        profilePicture: step1?.profilePicture,
        language: step1?.language,
        isEmailVerified: true,
        isMobileVerified: false
      };
      redisClient.deleteKey(`${SERVER.APP_NAME}.${params.email}.${params.type}`);
      await userDaoV1.findOneAndUpdate(
        collection,
        { _id: step1._id },
        { refreshToken, status: STATUS.ACTIVE, lastLogin: Date.now(), isEmailVerified: true }
      );
      dataToReturn = encryptData(JSON.stringify(dataToReturn));
      return userConstant.MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function contactUs
   * @description This function is used to ask query
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.query user's query (required)
   * @returns
   */
  async contactUs(payload:UserRequest.Payload, tokenData: TokenData) {
    try {
      const providerColl = encryptedDb.getProviderEncryptedClient();
      const ticketColl = encryptedDb.getTicketEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.ContactUs = JSON.parse(decryptedData);
      const validation = contactUs.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const isUserExist = await userDaoV1.findUserById(tokenData.userId);
      if (!isUserExist) return Promise.reject(userConstant.MESSAGES.ERROR.USER_DOES_NOT_EXIST);
      let mailData = {
        type: userConstant.MAIL_TYPE.CONTACT_US,
        email: isUserExist.email,
        name: isUserExist.fullName,
      }
      let clinic;
      if(isUserExist.clinicId){
        clinic = await userDaoV1.findOne(providerColl, {clinicId: isUserExist.clinicId, createdBy: USER_TYPE.ADMIN});
      }
      let firstName;
      let lastName;
      if (!isUserExist.firstName && !isUserExist.lastName) {
        const nameParts = isUserExist.fullName.trim().split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
    }
      const data = {
        requestNo: getRandomOtp(5),
        details: params.query,
        userId: isUserExist._id,
        status: STATUS.ACTIVE,
        clinicId: isUserExist?.clinicId,
        clinicName: clinic?.clinicName,
        created: Date.now(),
        email: isUserExist?.email,
        firstName: isUserExist?.firstName || firstName,
        lastName: isUserExist?.lastName || lastName
      }
      await ticketColl.insertOne(data);
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      return userConstant.MESSAGES.SUCCESS.CONTACT_US;
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function deleteAccount
   * @description This function is use to delete the user's account 
   * @param params.userId User Id (required)
   * @returns 
   */
  async deleteAccount(params: UserId){
    try{
      const providerColl = encryptedDb.getProviderEncryptedClient();
      const isUser = await userDaoV1.findUserById(params.userId);
      if(!isUser)return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);

      const data = await userDaoV1.deleteAccount(params.userId);
      if(isUser.clinicId){
        const clinicData = await userDaoV1.findOne(providerColl, { clinicId: isUser.clinicId, createdBy: USER_TYPE.ADMIN });
        const count = clinicData.totalPaitents - 1;
        await userDaoV1.updateOne(
          providerColl, 
          { clinicId: isUser.clinicId, createdBy: USER_TYPE.ADMIN},
          {totalPaitents: count}
        );
      }
      return userConstant.MESSAGES.SUCCESS.ACCOUNT_DELETED;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function refreshToken
   * @description generate the new token using referesh token
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.refereshToken user's referesh token (required)
   * @param params.deviceId user's device id (required)
   * @param params.deviceToken user's device token (required)
   * @returns token object
   */
  async refreshToken(payload: UserRequest.Payload, headers: any, remoteAddress: string){
    try{
      const collection = encryptedDb.getUserEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.RefereshToken = JSON.parse(decryptedData);
      const validation = generateToken.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      const isTokenExist = await userDaoV1.findOne(collection, {refreshToken: params.refreshToken});
      if (!isTokenExist)return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_REFRESH_TOKEN);
      const result = await validate(params.refreshToken, undefined, false);
      const step1 = await userDaoV1.findUserById(result.sub);
      if(!step1) return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      params.remoteAddress = remoteAddress;
      await this.removeSession(
        { userId: step1._id, deviceId: params.deviceId },
        true
      );
      const salt = crypto.randomBytes(64).toString("hex");
      const tokenData = {
        userId: step1._id,
        deviceId: params.deviceId,
        accessTokenKey: salt,
        type: TOKEN_TYPE.USER_LOGIN,
        userType: step1.userType,
      };
      const encryptedTokenData = encryptData(JSON.stringify(tokenData));
      let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } });
      const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
      const [accessToken, refreshToken] = await promise.join(
        authToken.data.jwtToken, authToken.data.refreshToken,
        loginHistoryDao.createUserLoginHistory({ ...params, ...headers, ...step1, salt, location, })
      );
      if (SERVER.IS_REDIS_ENABLE)
        redisClient.setExp(
          `${step1._id.toString()}.${params.deviceId}`,
          Math.floor(
            SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000
          ),
          JSON.stringify(buildToken({ ...step1, ...params, ...headers, salt }))
        );

      step1._id.toString();

      let data = {
        accessToken,
        refreshToken,
        userId: step1._id,
        email: step1.email,
        userType: step1.userType,
        fullName: step1?.fullName,
        countryCode: step1?.countryCode,
        mobileNo: step1?.mobileNo,
        fullMobileNo: step1?.fullMobileNo,
        status: step1?.status,
        language: step1?.language,
        isEmailVerified: step1.isEmailVerified,
        isMobileVerified: step1.isMobileVerified
      };

      if (!step1.isMobileVerified) {
        data.isMobileVerified = false;
      }

      userDaoV1.findOneAndUpdate(
        collection,
        { _id: step1._id },
        { refreshToken, lastLogin: Date.now() }
      );
      data = encryptData(JSON.stringify(data));
      return userConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function resendInvite
   * @description resend the invite to the patient
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.patientId patient id (required)
   * @returns
   */
  async resendInvite(payload: UserRequest.Payload, tokenData:TokenData){
    try{  
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: UserRequest.SentInvite = JSON.parse(decryptedData);
      const validation = sentInvite.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      const isPatient = await userDaoV1.findUserById(params.patientId);
      if(!isPatient)return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(isPatient.status !== STATUS.PENDING)return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_INVITATION)

      const providerName = params.providerName;
      delete params.providerName;
      let otp = getRandomOtp(6).toString();
      params.providerCode = otp;
      params.resendDate = Date.now();
      await userDaoV1.resendInvite(params);
      if (isPatient?.email) {
        let mailData = {
          type: userConstant.MAIL_TYPE.WELCOME_MAIL,
          email: isPatient.email,
          otp: otp,
          name: isPatient.fullName,
          providerName: providerName
        }
        mailData = encryptData(JSON.stringify(mailData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData } });
      }
      if (isPatient?.fullMobileNo) {
        let messageData = {
          to: isPatient.fullMobileNo,
          body: OTP_BODY.CREATE_PATIENT + otp
        }
        messageData = encryptData(JSON.stringify(messageData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MESSAGE, "body": { data: messageData } });
      }
      return userConstant.MESSAGES.SUCCESS.INVITE_SENT;
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getAllPatients
   * @description get the listing of all patients active/inactive
   * @param params.pageNo page no (required)
   * @param params.limit limit (required) 
   * @returns list of all patients
   */
  async getAllPatients(params: UserRequest.PatientListing, tokenData: TokenData){
    try{
      let data = await userDaoV1.getAllPatients(params, tokenData);
      data = encryptData(JSON.stringify(data));
      return MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function resetPatientPassword
   * @description Reset the user's password by admin
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId user's id (required)
   * @returns
   */
  async resetPatientPassword(payload: UserRequest.Payload, tokenData: TokenData){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: UserRequest.ResetPassword = JSON.parse(decryptedData);
      const validation = getUserProfile.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }

      const isUserExists = await userDaoV1.findUserById(params.userId);
      if (!isUserExists) return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);

      if(isUserExists.status === STATUS.INACTIVE)return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED);

      let password = passwordGenrator(11);
      const salt = genRandomString(SERVER.SALT_ROUNDS);
      params.salt = salt
      params.hash = encryptHashPassword(password, salt)
      await userDaoV1.resetPatientPassword(params);
      let mailData = {
        type: userConstant.MAIL_TYPE.RESET_PASSWORD,
        email: isUserExists.email,
        password: password,
        name: isUserExists.fullName,
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      return userConstant.MESSAGES.SUCCESS.RESET_PASSWORD
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updatePatientStatus
   * @description Block the status of patient by super admin
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId user's id (required)
   * @returns 
   */
  async updatePatientStatus(payload: UserRequest.Payload, tokenData: TokenData){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: UserRequest.updateStatus = JSON.parse(decryptedData);
      const validation = getUserProfile.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }

      const isUserExists = await userDaoV1.findUserById(params.userId);
      if (!isUserExists) return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);

      if(isUserExists.status === STATUS.INACTIVE)return Promise.reject(userConstant.MESSAGES.ERROR.BLOCKED);

      await userDaoV1.updateStatus(params)
      let mailData = {
        type: userConstant.MAIL_TYPE.ACCOUNT_DEACTIVATE,
        email: isUserExists.email,
        name: isUserExists.fullName,
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      await this.removeSession(params, true);
      return userConstant.MESSAGES.SUCCESS.BLOCK_USER
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function editPatientDetails
   * @description edit the details of patient from the provider
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.patientId patient id (required)
   * @returns object of upadted data
   */
  async editPatientDetails(payload: UserRequest.Payload, tokenData: TokenData, headers:any) {
    try {
      const providerColl = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: UserRequest.EditPatientDetails = JSON.parse(decryptedData);
      const validation = editPatient.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }

      const isUser = await userDaoV1.findUserById(params.patientId);
      if (!isUser) return Promise.reject(userConstant.MESSAGES.ERROR.USER_NOT_FOUND);

      const provider = await userDaoV1.findOne(providerColl,{_id: toObjectId(tokenData.userId)});

      if (params.countryCode && params.mobileNo) {
        params.fullMobileNo = params.countryCode + params.mobileNo;
        const isMobileExists = await userDaoV1.isMobileExists(params);
        if (isMobileExists) return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
      }
      if (params.email) {
        const isEmailExists = await userDaoV1.isEmailExists(params);
        if (isEmailExists) return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
      }
      if (params.isDelivered && params.deliveredDate && isUser.status === STATUS.INACTIVE) return Promise.reject(userConstant.MESSAGES.ERROR.USER_ALREADY_INACTIVE);
      if (params.dueDate && isUser.status !== STATUS.INACTIVE) return Promise.reject(userConstant.MESSAGES.ERROR.CANT_EDIT_DUEDATE)
      let data = await userDaoV1.editPatientDetails(params, isUser);
      let notificationData = {
        type: NOTIFICATION_TYPE.UPDATE_PAITENT,
        userId: [params.patientId],
        platform: headers.platform,
        details: {
          name: provider.adminName,
        }
      }
      notificationData = encryptData(JSON.stringify(notificationData));
      await this.inAppNotification(notificationData);
      data = encryptData(JSON.stringify(data));
      return userConstant.MESSAGES.SUCCESS.PATIENT_EDIT(data);
    }
    catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async inAppNotification(params){
    try{
      setTimeout(async() => {
        await axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": {data: params} });
      }, 500);
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function getUnreadNotificaionCount
   * @description get the count of unread notifications
   * @returns count of unread notifications
   */
  async getUnreadNotificaionCount(tokenData:TokenData){
    try{
      const count = await notificationDaoV1.countDocuments("notification_lists", {userId: toMongooseObjectId(tokenData.userId), isRead: false});
      let data: any = {};
      data.count = count;
      data = encryptData(JSON.stringify(data));
      return userConstant.MESSAGES.SUCCESS.NOTIFCATION_COUNT(data);
    }
    catch(error){
      throw error;
    }
  }
  /**
   * @function deviceToken
   * @description update deviceToken
   * @returns success
   */
  async deviceToken(payload: UserRequest.Payload, tokenData:TokenData) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: Device = JSON.parse(decryptedData);
      const validation = device.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }
      await loginHistoryDao.findOneAndUpdate("login_histories",{"userId._id": tokenData.userId, isLogin:true},{deviceToken:params.deviceToken});
      return userConstant.MESSAGES.SUCCESS.DEFAULT;
    }catch(error) {
      throw error;
    }
  }

  /**
   * @function getEpicPatientDetails
   * @description get the details of epic user
   * @param params 
   */
  async getEpicPatientDetails(params){
    try{
      const patientModel = encryptedDb.getUserEncryptedClient();
      let isAdded = false;
      const isPatient = await userDaoV1.findOne(patientModel, {epicId: params.patientId});
      if(isPatient){
        isAdded = true;
      }
      const result = await epic.getPatientData(params, true);
      const response = {
        patientId: result.entry[0].resource.id,
        name: result.entry[0].resource.name[0].text,
        mobileNo: result.entry[0].resource.telecom[0].value,
        dob : result.entry[0].resource.birthDate,
        isAdded: isAdded
      }
      const data = {
        data: [response],
        total: 1,
        pageNo: 1,
        totalPage: 1,
        nextHit: 0,
        limit: 10,
      }
      return data;
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function getEpicPatientDetailsById
   * @description get the details of patient details from epic by id
   * @param params 
   */
  async getEpicPatientDetailsById(params){
    try{
      const data = await epic.getPatientById(params.patientId);
      const response = {
        name: data.epicData.name[0].text,
        firstName: data.epicData.name[0].given[0],
        lastName: data.epicData.name[0].family,
        patientId: data.epicData.id,
        mobileNo: data.epicData.telecom[0].value,
        dob : data.epicData.birthDate,
        gender: data.epicData.gender,
        street: data.epicData.address[0].line[0],
        city: data.epicData.address[0].city,
        state: data.epicData.address[0].state,
        zipCode: data.epicData.address[0].postalCode,
        weight: data.response.weightValue,
        height: data.response.heightValue,
      }
      return response;
    }
    catch(error){
      throw error;
    }
  }

  async runCrone(params:UserRequest.Crone){
    try{
      console.log('****************switch case invoked**********************');
      switch(params.type){
        case userConstant.CRONE_TYPE.CHECK_DELIVERED:
          console.log('Running Cron Job - Checking delivered dates');
          await userDaoV1.checkDeliveredDate();
          break;
        case userConstant.CRONE_TYPE.ADD_MEAL_DATA:
          console.log('Running Cron Job - Adding meal data');
          await mealDaoV1.updateDeviceData();
          break;
        case userConstant.CRONE_TYPE.UPDATE_GRAPH_LAST_INTERVAL:
          console.log('Running Cron Job - Updating graph last interval');
          await userDaoV1.updateLibreGraphLastTimeInterval();
          break;
        case userConstant.CRONE_TYPE.LIBRE_DEVICE_DATA:
          console.log('Running Cron Job - Adding Libre device data of patient');
          await userDaoV1.getPatientLibreDeviceData();
          break;
        case userConstant.CRONE_TYPE.DEXCOM_DEVICE_DATA:
          console.log('Running Cron Job - Adding Dexcom device data of patient');
          await userDaoV1.getPatientDexcomDeviceData();
          break;
        case userConstant.CRONE_TYPE.ADD_FASTING_DATA:
          console.log('Running Cron Job - Adding fasting glucose data of patient');
          await mealDaoV1.updateFastingData();
          break;
        default:
          return Promise.reject(MESSAGES.ERROR.INVALID_CRONE_TYPE);
      }
      console.log('############switch case completed####################');
      return MESSAGES.SUCCESS.SUCCESS;
    }
    catch(error){
      throw error;
    }
  }
}

export const userController = new UserController();
