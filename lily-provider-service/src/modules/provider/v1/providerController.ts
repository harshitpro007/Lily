"use strict";
import * as _ from "lodash";
import * as crypto from "crypto";
import * as promise from "bluebird";
import {
  buildToken,
  encryptHashPassword,
  getLocationByIp,
  matchPassword,
  encryptData,
  decryptData,
  passwordGenrator,
  genRandomString,
  toObjectId,
  parseJwt,
  toMongooseObjectId,
} from "@utils/appUtils";
import {
  JOB_SCHEDULER_TYPE,
  STATUS,
  TOKEN_TYPE,
  SERVER,
  USER_TYPE,
  MESSAGES,
  LIBRA,
  SUBSCRIPTION_TYPE,
} from "@config/index";
import * as adminConstant from "@modules/provider/v1/providerConstant";
import { providerDaoV1 } from "@modules/provider/index";
import { baseDao } from "@modules/baseDao/index";
import { loginHistoryDao } from "@modules/loginHistory/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { v4 as uuidv4 } from 'uuid';
import { logger } from "@lib/logger";
import { axiosService } from "@lib/axiosService";
import * as AWS from "aws-sdk"
import { addPorvider, adminLogin, blockUnblock, changePassword, changeProfile, changeProviderProfile, editPatientStatus, editProvider, ehrLogin, forgotPassword, patient, preSignedUrl, provider, resetPassword, sentInvite, sentInviteToPatient } from "./routeValidator";
import { encryptedDb } from "@utils/DatabaseClient";
import { encryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { patientDaoV1 } from "@modules/patient";
import { DASHBOARD_TYPE, GLUCOSE_INTERVAL, REGISTERED_TYPE } from "@modules/provider/v1/providerConstant";
import { notificationDaoV1 } from "@modules/notification";

export class ProviderController {
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
          return;
        } else
          await redisClient.deleteKey(`${params.userId}.${params.deviceId}`);
          return;
      }
    } catch (error) {
      logger.error(error.stack);
      console.log("*************logout error", error);
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
   * @function login
   * @description Login of provider
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.password: user's password (required)
   * @param params.deviceId: device id (required)
   * @param params.deviceToken: device token (required)
   * @retuns data obj with token
   */
  async login(headers:any, payload:ProviderRequest.Payload, remoteAddress: string) {
    try {
      const collection = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.Login = JSON.parse(decryptedData);
      const validation = adminLogin.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      params.remoteAddress = remoteAddress;
      const step1 = await providerDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      const isPasswordMatched = await matchPassword(params.password,step1.hash,step1.salt);
      if (!isPasswordMatched)
        return Promise.reject(adminConstant.MESSAGES.ERROR.INCORRECT_PASSWORD);
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
          type: TOKEN_TYPE.PROVIDER_LOGIN,
          userType: step1.userType,
        };
        const encryptedTokenData = encryptData(JSON.stringify(tokenData));
        let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } })
        const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
        const [accessToken, refreshToken] = await promise.join(
          authToken.data.jwtToken,authToken.data.refreshToken,
          loginHistoryDao.createUserLoginHistory({...params, ...headers, ...step1, salt, location,})
        );
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${step1._id.toString()}.${params.deviceId}`,
            Math.floor(
              SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.ADMIN_LOGIN] / 1000
            ),
            JSON.stringify(buildToken({ ...step1, ...params, ...headers, salt }))
          );

        step1._id.toString();
        let data = {
          accessToken,
          userId: step1.userId,
          clinicName: step1.clinicName,
          adminName: step1.adminName,
          address: step1.address,
          email: step1.email,
          countryCode: step1.countryCode,
          mobileNo: step1.mobileNo,
          fullMobileNo: step1.fullMobileNo,
          userType: step1.userType,
          profilePicture: step1.profilePicture,
          created: step1.created, // optional
          status: step1.status,
          subscriptionType: step1.subscriptionType,
          subscriptionDescription: step1.subscriptionDescription,
          contract: step1.contract,
          isSubscribed: step1.isSubscribed,
          clinicId: step1.clinicId,
          isMainProvider: step1?.isMainProvider,
          createdBy: step1?.createdBy,
          subscriptionStartDate: step1?.subscriptionStartDate,
          subscriptionEndDate: step1?.subscriptionEndDate,
          isPasswordReset: step1?.isPasswordReset
        }
        providerDaoV1.findOneAndUpdate(
          collection,
          { _id: step1._id },
          { refreshToken, lastLogin: Date.now(), status: STATUS.ACTIVE }
        );

        data = encryptData(JSON.stringify(data));
        return adminConstant.MESSAGES.SUCCESS.LOGIN(data);
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
  async forgotPassword(payload: ProviderRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.ForgotPassword = JSON.parse(decryptedData);
      const validation = forgotPassword.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const step1 = await providerDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      else if (step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      const otp_count: any = await redisClient.getValue(
				`${step1._id}.attempt`
			);
			if (otp_count && JSON.parse(otp_count).count > 4)
				return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS);
      if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(`${step1._id}.key`, SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000, JSON.stringify({ email: step1.email }));//NOSONAR
      let mailData = {
        type: adminConstant.MAIL_TYPE.FORGOT_PASSWORD_LINK,
        email: params.email,
        name: step1.adminName,
        link: SERVER.PROVIDER_CREDENTIALS.URL + SERVER.PROVIDER_END_POINTS.FOR_GOT_PASSWORD + step1._id,
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      if (SERVER.IS_REDIS_ENABLE){
        redisClient.setExp(
          `${step1._id}.attempt`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.LINK_LIMIT / 1000,
          JSON.stringify({
            email: params.email,
            count: JSON.parse(otp_count)
              ? JSON.parse(otp_count).count + 1
              : 1,
          })
        );
      }
      return adminConstant.MESSAGES.SUCCESS.MAIL_SENT;
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
  async resetPassword(payload: ProviderRequest.Payload) {
    try {
      const providerColl = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.ChangeForgotPassword = JSON.parse(decryptedData);
      const validation = resetPassword.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      if (params.newPassword !== params.confirmPassword)
        return Promise.reject(adminConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH);
      let data: any = await redisClient.getValue(`${params.encryptedToken}.key`);
      data = JSON.parse(data)
      if (!data || data == null) return Promise.reject(adminConstant.MESSAGES.ERROR.TOKEN_EXPIRED);
      let email = data.email;
      const step1 = await providerDaoV1.isEmailExists({ email: email }); // check is email exist if not then restrict to send forgot password mail
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      params.email = email;
      params.hash = encryptHashPassword(params.newPassword, step1.salt);
      if(step1.hash === params.hash) return Promise.reject(adminConstant.MESSAGES.ERROR.SAME_PASSWORD);
      await providerDaoV1.changePassword(params);
      await providerDaoV1.findOneAndUpdate(providerColl, {_id: step1._id}, {isPasswordReset: true});
      redisClient.deleteKey(`${step1._id}.attempt`);
      redisClient.deleteKey(`${params.encryptedToken}.key`)
      return adminConstant.MESSAGES.SUCCESS.RESET_PASSWORD;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function logout
   * @description remove/end the user session
   * @param tokenData
   * @returns
   */
  async logout(tokenData: TokenData) {
    try {
      await this.removeSession(tokenData, true);
      return adminConstant.MESSAGES.SUCCESS.USER_LOGOUT;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function profile
   * @description user can get the profile details by userId
   * @param params.userId
   * @returns User's details obj
   */
  async profile(params: UserId, tokenData: TokenData) {
    try {
      let userId=params.userId?params.userId:tokenData.userId;
      let data = await providerDaoV1.getProfile(
        userId
      );
      if (!data) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.PROFILE(data);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updateStatus
   * @description update user's status  in DB active/inactive
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId: user's id (required)
   * @param params.status: user's new status
   * @returns
   */
  async updateStatus(payload: ProviderRequest.Payload, tokenData: TokenData) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);//NOSONAR
      let params: ProviderRequest.updateStatus = JSON.parse(decryptedData);
      const validation = blockUnblock.validate(params);
      if(validation.error) {//NOSONAR
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      if(toObjectId(params.userId).toString() === toObjectId(tokenData.userId).toString())//NOSONAR
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_USER)

      if(tokenData.userType !== USER_TYPE.ADMIN){//NOSONAR
        const isProvider = await providerDaoV1.findUserById(tokenData.userId);
        if(!isProvider)return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);//NOSONAR
        else if(isProvider.createdBy !== USER_TYPE.ADMIN && !isProvider.isMainProvider){//NOSONAR
          return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_USER);
          // if(isProvider.addedBy){//NOSONAR
          //   if(isProvider.addedBy.toString() !== toObjectId(tokenData.userId).toString())//NOSONAR
          // }
          // else if(!isProvider.addedBy)return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_USER);//NOSONAR
        }
      }

      const step1 = await providerDaoV1.findUserById(params.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);//NOSONAR
      await providerDaoV1.updateStatus(params, step1);
      if (params.status == STATUS.INACTIVE) {//NOSONAR
        let mailData = {
          type: adminConstant.MAIL_TYPE.ACCOUNT_DEACTIVATE,
          email: step1.email,
          name: step1?.createdBy === USER_TYPE.ADMIN? step1?.clinicName : step1?.adminName,
        }
        mailData = encryptData(JSON.stringify(mailData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
        return adminConstant.MESSAGES.SUCCESS.BLOCK_USER;
      } else {
        let mailData = {
          type: adminConstant.MAIL_TYPE.ACCOUNT_ACTIVATE,
          email: step1.email,
          name: step1?.createdBy === USER_TYPE.ADMIN? step1?.clinicName : step1?.adminName,
        }
        mailData = encryptData(JSON.stringify(mailData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
        return adminConstant.MESSAGES.SUCCESS.UNBLOCK_USER;
      }
    } catch (error) {//NOSONAR
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function changePassword
   * @description change the password using old password
   * @params payload contains encrypted data : decrypted params defined below
   * @param payload.oldPassword user's old password (required)
   * @param payload.newPassword user's new password (required)
   * @param tokenData 
   * @returns 
   */
  async changePassword(params: ProviderRequest.Payload, tokenData: TokenData) {
    try {
      let decryptedData = decryptData(params.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let payload: ProviderRequest.ChangePassword = JSON.parse(decryptedData);
      const validation = changePassword.validate(payload);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const step1 = await providerDaoV1.findUserById(tokenData.userId, { salt: 1, hash: 1, status: 1 });
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      if(step1._id.toString() !== toObjectId(tokenData.userId).toString())
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_USER);

      if (payload.confirmPassword) {
        if (payload.newPassword != payload.confirmPassword) {
          return adminConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH;
        }
      }
      if (payload.oldPassword == payload.newPassword) return Promise.reject(adminConstant.MESSAGES.ERROR.SAME_PASSWORD)
      const oldHash = encryptHashPassword(payload.oldPassword, step1.salt);
      if (oldHash != step1.hash) return Promise.reject(MESSAGES.ERROR.INVALID_OLD_PASSWORD);
      payload["hash"] = encryptHashPassword(payload.newPassword, step1.salt);
      const result = await providerDaoV1.changeProfilePassword(payload, tokenData.userId);
      if (!result) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG);
      await this.removeSession(tokenData, true);
      return MESSAGES.SUCCESS.CHANGE_PASSWORD;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function changeClinicProfile
   * @description Edit the clinic's profile
   * @params payload contains encrypted data : decrypted params defined below
   * @param tokenData 
   * @returns 
   */
  async changeClinicProfile(params: ProviderRequest.Payload, tokenData: TokenData) {
    try {
      const patientColl = encryptedDb.getPatientEncryptedClient();
      let decryptedData = decryptData(params.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);//NOSONAR
      let payload: ProviderRequest.ChangeProfile = JSON.parse(decryptedData);
      const validation = changeProfile.validate(payload);
      if(validation.error) {//NOSONAR
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      if (payload.clinicName === "") return Promise.reject(adminConstant.MESSAGES.ERROR.EMPTY_NAME);//NOSONAR
      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);//NOSONAR
      if(step1.status === STATUS.INACTIVE)//NOSONAR
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      if(payload.currentPassword && payload.newPassword){//NOSONAR
        if (payload.confirmPassword) {//NOSONAR
          if (payload.newPassword != payload.confirmPassword) {//NOSONAR
            return adminConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH;
          }
        }
        if (payload.currentPassword == payload.newPassword) return Promise.reject(adminConstant.MESSAGES.ERROR.SAME_PASSWORD)//NOSONAR
        const oldHash = encryptHashPassword(payload.currentPassword, step1.salt);
        if (oldHash != step1.hash) return Promise.reject(MESSAGES.ERROR.INVALID_OLD_PASSWORD);//NOSONAR
        payload["hash"] = encryptHashPassword(payload.newPassword, step1.salt);
        await this.removeSession(tokenData, true);
      }
      if(payload.countryCode && payload.mobileNo){//NOSONAR
        payload.fullMobileNo = payload.countryCode + payload.mobileNo;
        const isMobileExists = await providerDaoV1.isMobileExists(payload);
        if(isMobileExists)return Promise.reject(adminConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
      }
      const result = await providerDaoV1.changeClinicProfile(payload, tokenData.userId, step1.clinicId);
      if(payload.glucoseInterval){
        await providerDaoV1.updateMany(patientColl, {clinicId: step1.clinicId, status: {$ne: STATUS.DELETED}}, {glucoseInterval: payload.glucoseInterval});
      }
      if (!result) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG);//NOSONAR
      return adminConstant.MESSAGES.SUCCESS.EDIT_PROFILE;
    } catch (error) {//NOSONAR
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
  async decrypt(payload: ProviderRequest.decrypt) {
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
   * @function createProvider
   * @description Create the clinic
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required)
   * @param params.mobileNo user's mobileNo (required)
   * @param params.organizationalNPI clinic NIP (required)
   * @param params.clinicName clinic name (required)
   * @param params.providerName provider's name (required)
   * @returns
   */
  async createProvider(payload: ProviderRequest.Payload, tokenData: TokenData){
    try{
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.Create = JSON.parse(decryptedData);
      const validation = provider.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      const isEmailExists = await providerDaoV1.isEmailExists(params);
      if(isEmailExists)return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);

      params.fullMobileNo = params?.countryCode + params?.mobileNo;
      const isMobileExists = await providerDaoV1.isMobileExists(params);
      if(isMobileExists)return Promise.reject(adminConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
      if(params.organizationalNPI){
        const isNPIExist = await providerDaoV1.isNPIExists(params);
        if(isNPIExist)return Promise.reject(adminConstant.MESSAGES.ERROR.NPI_ALREADY_EXIST);  
      }
     
      if (tokenData.userType === USER_TYPE.ADMIN) {

        let password = passwordGenrator(11);
        params.userType = USER_TYPE.PROVIDER;
        params.status = STATUS.PENDING;
        params.createdBy = USER_TYPE.ADMIN;
        params.totalPaitents = 0;
        params.totalProviders = 1;
        if(params.subscriptionType === SUBSCRIPTION_TYPE.FREE){
          params.isSubscribed = true;
          params.subscriptionStartDate = Date.now();
        }
        else{
          params.isSubscribed = false;
        }
        params.isMainProvider = true;
        params.registeredType = REGISTERED_TYPE.ADMIN,
        params.clinicId = uuidv4();
        params.salt = genRandomString(SERVER.SALT_ROUNDS);
        params.hash = encryptHashPassword(password, params.salt);
        params.glucoseInterval = params.glucoseInterval ? params.glucoseInterval : GLUCOSE_INTERVAL.ONE;
        params.isPasswordReset = false;
        params.resendDate = Date.now();
        await providerDaoV1.createProvider(params);
        const link= SERVER.PROVIDER_CREDENTIALS.URL;
        let mailData = {
          type: adminConstant.MAIL_TYPE.CREATE_PROVIDER,
          email: params.email,
          name: params.clinicName,
          adminName: params.adminName,
          password: password,
          contract: params.contract,
          link: link
        }
        mailData = encryptData(JSON.stringify(mailData));
        let dashboard = {
          type: DASHBOARD_TYPE.CLINIC,
        }
        dashboard = encryptData(JSON.stringify(dashboard));
        setTimeout(async() => {
          await axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
          await axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": {data: dashboard} })
        }, 500);
        if(params.subscriptionType === SUBSCRIPTION_TYPE.FREE){
          await this.addSubscription(params);
        }
        return adminConstant.MESSAGES.SUCCESS.CLINIC_CREATED;
      } else {
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_ADMIN);
      }
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  async addSubscription(params){
    try{
      const isEmailExists = await providerDaoV1.isEmailExists(params);
      const subscriptionModel = encryptedDb.getsubscriptionEncryptedClient();
      const transcationModel = encryptedDb.getTransactionEncryptedClient();
      const subscriptionData = {
        subscriptionType: SUBSCRIPTION_TYPE.FREE,
        email: isEmailExists.email,
        userId: toObjectId(isEmailExists._id.toString()),
        amount: 0,
        status: STATUS.ACTIVE,
        subscriptionStartDate: Date.now(),
        clinicName: isEmailExists.clinicName,
        clinicId: isEmailExists.clinicId,
      }
      const transactionId = crypto.randomInt(10**4, 10**5-1).toString();
      const transactionData = {
        userId: toObjectId(isEmailExists._id.toString()),
        transactionId: transactionId,
        amount: 0,
        clinicName: isEmailExists.clinicName,
        clinicId: isEmailExists.clinicId,
        status: STATUS.SUCCESS
      }
      await providerDaoV1.insertOne(subscriptionModel,subscriptionData);
      await providerDaoV1.insertOne(transcationModel, transactionData);
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function createPatient
   * @description Add the patient into clinic
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email user's email (required)
   * @param params.name user's name (required) etc remaining keys will contains patient model
   * @returns
   */
  async createPatient(payload: ProviderRequest.Payload, accessToken: string, tokenData: TokenData){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.CreatePatient = JSON.parse(decryptedData);
      const validation = patient.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }

      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      
      params.providerName = step1.adminName;
      params = encryptData(JSON.stringify(params));
      await axiosService.post({ "url": SERVER.PATIENT_APP_URL + SERVER.CREATE_PATIENT, "body":  {data:params}, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.PATIENT_CREATED;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getProviderListing
   * @description get the listing of providers
   * @param params.pageNo page no (required)
   * @param params.limit limit (required)
   * @returns array of object 
   */
  async getProviderListing(params: ProviderRequest.ProviderListing, tokenData: TokenData){
    try{  
      let data = await providerDaoV1.getProviderListing(params, tokenData);
      data = encryptData(JSON.stringify(data));
			return MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getPatientListing
   * @description get the patient listing
   * @param params.pageNo page no (required)
   * @param params.limit limit (required)
   * @returns array of object 
   */
  async getPatientListing(params: ProviderRequest.PatientListing, tokenData:TokenData, accessToken:string){
    try{
      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      let data = await axiosService.getData({"url":SERVER.PATIENT_APP_URL + SERVER.GET_PATIENTS, "payload": params, auth: accessToken });
      data = decryptData(data.data);
      data = JSON.parse(data);
      const providerColl = encryptedDb.getProviderEncryptedClient();
			const providerIds = data.data.map(item => toObjectId(item.providerId));
			const providerData = await providerDaoV1.find(providerColl, { _id: { $in: providerIds } }, { projection: { adminName: 1 } });
			const providerLookup: any = {};
			providerData.forEach((provider: any) => {
				providerLookup[provider._id] = provider.adminName;
			});

			data.data.forEach((item: any) => {
				item.providerName = providerLookup[item.providerId] || null;
			});

      data = encryptData(JSON.stringify(data));
      return MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
	 * @function preSignedURL   
	 * @description Get a predefined URL for uploading profile picture
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.filename file name (required)
   * @param params.fileType file type (required)
   * @returns preSigned url object
	 */
	async preSignedURL(payload: ProviderRequest.Payload,tokenData: TokenData) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.PreSignedUrl = JSON.parse(decryptedData);
      const validation = preSignedUrl.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const ENVIRONMENT = process.env.NODE_ENV.trim();
      const ENVIRONMENT2 = ["dev", "qa", "local"]
      if (ENVIRONMENT2.includes(ENVIRONMENT)) {
        AWS.config.update({
          accessKeyId: SERVER.AWS_IAM_USER.ACCESS_KEY_ID,
          secretAccessKey: SERVER.AWS_IAM_USER.SECRET_ACCESS_KEY,
          region: SERVER.S3.REGION,
        });
      }else {
        AWS.config.update({
          region: SERVER.S3.REGION
        });
      }
      const s3 = new AWS.S3();
      const data = {
        Bucket: SERVER.S3.BUCKET_NAME,
        Key: params.filename,
        Expires: 60 * 2, // URL expiration time in seconds
        ContentType: params.fileType,
        // ACL: 'private', // Access control, you can adjust this based on your requirements
      };
      const presignedUrl: { url: string } = {
        url: String(await s3.getSignedUrlPromise('putObject', data)),
      };

      return MESSAGES.SUCCESS.DETAILS(presignedUrl);

    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getPatientProfile
   * @description get the profile details of patient
   * @param params.userId user's id (required)
   * @param accessToken 
   * @returns Object of patient details
   */
  async getPatientProfile(params: UserId, accessToken: string, tokenData: TokenData){
    try{
      const collection = encryptedDb.getProviderEncryptedClient();
      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      let data = await axiosService.getData({"url":SERVER.PATIENT_APP_URL + SERVER.PATIENT_PROFILE, "payload": params, "auth": accessToken });
      let patientData = await decryptData(data.data);
      patientData = JSON.parse(patientData);
      const patient = await encryptionBaseDao.findOne(collection,{_id: toObjectId(patientData.providerId)}, {projection: {adminName:1}});
      patientData.providerName = patient.adminName
      patientData = await encryptData(JSON.stringify(patientData));
      return MESSAGES.SUCCESS.DETAILS(patientData);
    }
    catch(error){
      logger.error(error);
      throw error.response.data;
    }
  }

  /**
   * @function ehrLogin
   * @description provider can login via EHR
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.ehrToken user's token (requried)
   * @returns provider login data object
   */
  async ehrLogin(payload:ProviderRequest.Payload, headers:any, remoteAddress: string){
    try{
      const collection = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.EhrLogin = JSON.parse(decryptedData);
      const validation = ehrLogin.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      const token = parseJwt(params.ehrToken);
      let result;
      const step1 = await providerDaoV1.findOne(collection, {ehrToken: token.sub});
      if(!step1){
        // const mobileNo= getRandomOtp(10);
        const dataToSave = {
          // adminName: "ehr admin",
          userType: USER_TYPE.PROVIDER,
          status: STATUS.ACTIVE,
          createdBy: USER_TYPE.ADMIN,
          totalPaitents: 0,
          totalProviders: 1,
          isSubscribed: false,
          isMainProvider: true,
          clinicId: uuidv4(),
          // clinicName: `EHR${getRandomOtp(4)}`,
          registeredType: REGISTERED_TYPE.EHR,
          ehrToken: token.sub,
          isPasswordReset: true,
          // subscriptionType : SUBSCRIPTION_TYPE.MONTHLY,
          // subscriptionCharges : 50,
          // email: `ehr${getRandomOtp(4)}@yopmail.com`,
          // countryCode : "+1",
          // mobileNo : mobileNo,
          // fullMobileNo : `+1${mobileNo}`,
        }
        await providerDaoV1.createProvider(dataToSave);
        params.remoteAddress = remoteAddress;
        const data = await providerDaoV1.findOne(collection, {ehrToken: token.sub});
        result = await this.loginWithEHR(params,data,headers);
        return adminConstant.MESSAGES.SUCCESS.LOGIN(result)
      }
      else{
        if (step1.status === STATUS.INACTIVE)
          return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

        params.remoteAddress = remoteAddress;
        result = await this.loginWithEHR(params,step1,headers)
        return adminConstant.MESSAGES.SUCCESS.LOGIN(result)
      }
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function loginWithEHR
   * @descriptions Login with EHR helper function 
   * @returns user's details object with access token
   */
  async loginWithEHR(params:ProviderRequest.EhrLogin, step1:any, headers:any){
    try{
      const collection = encryptedDb.getProviderEncryptedClient();
      const salt = crypto.randomBytes(64).toString("hex");
      const tokenData = {
        userId: step1._id,
        deviceId: params.deviceId,
        accessTokenKey: salt,
        type: TOKEN_TYPE.PROVIDER_LOGIN,
        userType: step1.userType,
      };
      await this.removeSession({ userId: step1._id, deviceId: params.deviceId },true);
      const encryptedTokenData = encryptData(JSON.stringify(tokenData));
      let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } })
      const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
      const [accessToken, refreshToken] = await promise.join(
        authToken.data.jwtToken,authToken.data.refreshToken,
        loginHistoryDao.createUserLoginHistory({...params, ...headers, ...step1, salt, location,})
      );
      if (SERVER.IS_REDIS_ENABLE)
        redisClient.setExp(
          `${step1._id.toString()}.${params.deviceId}`,
          Math.floor(
            SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.ADMIN_LOGIN] / 1000
          ),
          JSON.stringify(buildToken({ ...step1, ...params, ...headers, salt }))
        );

      step1._id.toString();
      let data = {
        accessToken,
        userId: step1?._id,
        clinicName: step1?.clinicName,
        adminName: step1?.adminName,
        address: step1?.address,
        email: step1?.email,
        mobileNo: step1?.mobileNo,
        userType: step1?.userType,
        profilePicture: step1?.profilePicture,
        created: step1?.created, // optional
        status: step1?.status,
        subscriptionType: step1?.subscriptionType,
        subscriptionDescription: step1?.subscriptionDescription,
        contract: step1?.contract,
        isSubscribed: step1?.isSubscribed,
        clinicId: step1?.clinicId,
        ehrToken: step1?.ehrToken
      }
      providerDaoV1.findOneAndUpdate(
        collection,
        { _id: step1._id },
        { refreshToken, lastLogin: Date.now() }
      );

      data = encryptData(JSON.stringify(data));
      return data;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function resendInvite
   * @description resend the clinic invite to the peovider
   * @payload payload contains encrypted data : decrypted params defined below
   * @param payload.providerId provider id (required)
   * @returns
   */
  async resendInvite(payload: ProviderRequest.Payload, tokenData: TokenData){
    try{  
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.SentInvite = JSON.parse(decryptedData);
      const validation = sentInvite.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      const isProvider = await providerDaoV1.findUserById(params.providerId);
      if(!isProvider)return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(isProvider?.lastLogin)return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_INVITATION)
      
      const step1 = await providerDaoV1.findUserById(tokenData.userId);

      if (tokenData.userType === USER_TYPE.ADMIN || ((step1?.createdBy === USER_TYPE.ADMIN || step1?.isMainProvider) && isProvider.createdBy !== USER_TYPE.ADMIN)) {
        let password = passwordGenrator(11);
        params.salt = genRandomString(SERVER.SALT_ROUNDS);
        params.hash = encryptHashPassword(password, params.salt);
        params.resendDate = Date.now();
        await providerDaoV1.resendInvite(params);
        const link= SERVER.PROVIDER_CREDENTIALS.URL;
        let mailData = {
          type: adminConstant.MAIL_TYPE.CREATE_PROVIDER,
          email: isProvider?.email,
          name: isProvider?.clinicName,
          adminName: isProvider?.adminName,
          password: password,
          contract: isProvider?.contract,
          link: link
        }
        mailData = encryptData(JSON.stringify(mailData));
        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
        return adminConstant.MESSAGES.SUCCESS.INVITE_SENT;
      } else {
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_ADMIN);
      }
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function resendInvite
   * @description Re-send the invite to the pending clinic's
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.providerId provider id (required)
   * @param accessToken (required)
   * @returns 
   */
  async resendInviteToPatient(payload:ProviderRequest.Payload, accessToken: string, tokenData: TokenData){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); 
      let params: ProviderRequest.SentInviteToPatient = JSON.parse(decryptedData);
      const validation = sentInviteToPatient.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      params.providerName = step1.adminName;
      params = encryptData(JSON.stringify(params));
      await axiosService.post({ "url": SERVER.PATIENT_APP_URL + SERVER.SEND_INVITE, "body":  {data: params}, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.INVITE_SENT;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function verifyLink
   * @description verify the token is expired or not on forgot password 
   * @param params.token token (required)
   * @returns 
   */
  async verifyLink(params: ProviderRequest.VerifyLink){
    try{
      let data: any = await redisClient.getValue(`${params.token}.key`);
      data = JSON.parse(data)
      if (!data || data == null) return Promise.reject(adminConstant.MESSAGES.ERROR.TOKEN_EXPIRED);

      return adminConstant.MESSAGES.SUCCESS.VALID_TOKEN;
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function addProvider
   * @description Add provider in clinic
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.name user's name (required)
   * @param params.email user's email (required)
   * @param params.mobileNo user's mobile no (required)
   * @param params.role user's role (required)
   * @param params.clinicId clinic id (required)
   * @returns 
   */
  async addProvider(payload:ProviderRequest.Payload, tokenData: TokenData, headers: any){
    try{
      const providerColl = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); 
      let params: ProviderRequest.AddProvider = JSON.parse(decryptedData);
      const validation = addPorvider.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      
      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      if(step1.createdBy !== USER_TYPE.ADMIN){
        if(step1.isMainProvider === false){
          return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_USER);
        }
      }

      const clinicData = await providerDaoV1.findOne(providerColl, { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN, status: STATUS.ACTIVE });
      if(!clinicData) return Promise.reject(adminConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

      const isEmailExists = await providerDaoV1.isEmailExists(params);
      if(isEmailExists)return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);

      if(params?.countryCode && params?.mobileNo){
        params.fullMobileNo = params?.countryCode + params?.mobileNo;
        const isMobileExists = await providerDaoV1.isMobileExists(params);
        if(isMobileExists)return Promise.reject(adminConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
      }

      let password = passwordGenrator(11);
      params.status = STATUS.ACTIVE;
      params.createdBy = USER_TYPE.PROVIDER;
      params.adminName = params?.firstName + " " + params?.lastName;
      params.isMainProvider = params?.isMainProvider || false;
      params.salt = genRandomString(SERVER.SALT_ROUNDS);
      params.hash = encryptHashPassword(password, params.salt);
      params.addedBy = toObjectId(tokenData.userId);
      params.isPasswordReset = false;
      params.isSubscribed =false;
      if(clinicData?.isSubscribed){
        params.isSubscribed = true;
        params.subscriptionEndDate = clinicData.subscriptionEndDate;
        params.subscriptionStartDate = clinicData.subscriptionStartDate;
        params.subscriptionType = clinicData.subscriptionType,
        params.subscriptionCharges = clinicData.subscriptionCharges,
        params.contract = clinicData.contract
      }
      await providerDaoV1.createProvider(params);
      const link= SERVER.PROVIDER_CREDENTIALS.URL;
      let providerType;
      if(params.userType === USER_TYPE.PROVIDER || params.userType === USER_TYPE.DOCTOR){
        providerType = adminConstant.PROVIDER_TYPES.supervising_provider;
      }
      else if(params.userType === USER_TYPE.NURSE){
        providerType = adminConstant.PROVIDER_TYPES.other_clinical_staff;
      }
      else{
        providerType = adminConstant.PROVIDER_TYPES.non_clinical_staff;
      }
      let mailData = {
        type: adminConstant.MAIL_TYPE.ADD_PROVIDER,
        email: params.email,
        name: clinicData.clinicName,
        adminName: params.adminName,
        password: password,
        providerType: providerType,
        link: link
      }
      mailData = encryptData(JSON.stringify(mailData));
      axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      const count = clinicData.totalProviders + 1;
      await providerDaoV1.updateOne(
        providerColl,
        { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN },
        { totalProviders: count }
      );
      const providerIds = await providerDaoV1.distinct(providerColl, "_id", {_id: {$ne: toObjectId(tokenData.userId)}, clinicId: params.clinicId, userType: USER_TYPE.PROVIDER, fullMobileNo: {$ne: params.fullMobileNo}});
      let notificationData = {
        type: adminConstant.NOTIFICATION_TYPE.ADD_PROVIDER,
        userId: providerIds,
        platform: headers.platform,
        details: {
          name: step1.adminName,
          roleType: providerType
        }
      }
      notificationData = encryptData(JSON.stringify(notificationData));
      await this.inAppNotification(notificationData);
      let dashboard = {
        type: DASHBOARD_TYPE.PROVIDER,
      }
      dashboard = encryptData(JSON.stringify(dashboard));
      await this.dashboard(dashboard);
      return adminConstant.MESSAGES.SUCCESS.PROVIDER_CREATED;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  async dashboard(params){
    try{
      setTimeout(async() => {
        axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": {data: params} });
      }, 500);
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function getProvidersListing
   * @description get the listing of providers of a clinic
   * @param params.pageNo page no (required)
   * @param params.limit limit (required)
   * @param params.clinicId clinic id (required)
   * @returns array of providers listing
   */
  async getProvidersListing(params: ProviderRequest.ProviderListing, tokenData:TokenData){
    try{
      const providerColl = encryptedDb.getProviderEncryptedClient();

      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      const clinicData = await providerDaoV1.findOne(providerColl, { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN, status: STATUS.ACTIVE });
      if(!clinicData) return Promise.reject(adminConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

      let data = await providerDaoV1.getProvidersListing(params);
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getProviderDetails
   * @description Get the details of provider of a clinic
   * @param params.providerId provider id (required)
   * @returns provider details object
   */
  async getProviderDetails(params: UserId, tokenData: TokenData){
    try{
      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      let data = await providerDaoV1.getProviderDetails(params.userId)
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updateProviderDetails
   * @description update the details of provider of a clinic
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.providerId provider id (required)
   * @returns
   */
  async updateProviderDetails(payload: ProviderRequest.Payload, tokenData: TokenData, headers:any){
    try{
      const providerColl = encryptedDb.getProviderEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.ChangeProfile = JSON.parse(decryptedData);
      const validation = changeProviderProfile.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      const step1 = await providerDaoV1.findUserById(params.providerId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);

      const provider = await providerDaoV1.findUserById(tokenData.userId);
      if (provider?.createdBy === USER_TYPE.ADMIN || provider?.isMainProvider === true || step1?.addedBy.toString() === toObjectId(tokenData.userId).toString()) {
        if (step1.status === STATUS.INACTIVE)
          return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

        if (params.countryCode && params.mobileNo) {
          params.fullMobileNo = params.countryCode + params.mobileNo;
          const isMobileExists = await providerDaoV1.isMobileExists(params);
          if (isMobileExists) return Promise.reject(adminConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
        }
        const result = await providerDaoV1.changeProviderProfile(params);
        let notificationData = {
          type: adminConstant.NOTIFICATION_TYPE.UPDATE_PROVIDER,
          userId: [params.providerId],
          platform: headers.platform
        }
        notificationData = encryptData(JSON.stringify(notificationData));
        await this.inAppNotification(notificationData);
        if (!result) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG);
        return adminConstant.MESSAGES.SUCCESS.EDIT_PROFILE;
      }
      else {
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_USER);
      }
      
    }
    catch(error){
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
   * @function getClinicData
   * @description get the details of clinic by clinic name
   * @param params.clinicName clinic name (required);
   * @returns list of clinic detials
   */
  async getClinicData(params:ProviderRequest.Clinic, tokenData: TokenData){
    try{
      let data = await providerDaoV1.getClinicData(params, tokenData);
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getProviderData
   * @description get the details of provider by provider name
   * @param params.providerName provider name (required);
   * @returns list of provider detials
   */
  async getProviderData(params:ProviderRequest.Provider, tokenData: TokenData){
    try{
      let data = await providerDaoV1.getProviderData(params, tokenData);
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getCityState
   * @description get the state and city using zip code
   * @param params.zipCode zip code (required)
   * @param params.countryCode country code (required)
   * @returns object of city and state 
   */
  async getCityState(params: ProviderRequest.GetCity){
    try{
      const codes: any = params.codes;
      params.country = 'us'

      const results  = await providerDaoV1.getCityState(params);
      if (results.results[codes]) {
        const data = results.results[codes];
        if (data.length === 0)
          return Promise.reject(adminConstant.MESSAGES.ERROR.ZIP_CODE_NOT_FOUND);
        const {country_code} = data[0]
        const countryName = adminConstant.COUNTRY_CODES[country_code]
        data[0]['country_name'] = countryName
        const result = encryptData(JSON.stringify(data[0]));
        return MESSAGES.SUCCESS.DETAILS(result);
      } else {
        return Promise.reject(adminConstant.MESSAGES.ERROR.ZIP_CODE_NOT_FOUND);
      }
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function searchProviders
   * @description search the provider of a clinic
   * @param params.clinicId clinic id (required)
   * @param params.searchKey search key (required)
   * @returns list of providers
   */
  async searchProviders(params: ProviderRequest.ProviderListing, tokenData: TokenData){
    try{
      const providerColl = encryptedDb.getProviderEncryptedClient();
      const step1 = await providerDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if(step1.status === STATUS.INACTIVE)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);

      const clinicData = await providerDaoV1.findOne(providerColl, { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN, status: STATUS.ACTIVE });
      if(!clinicData) return Promise.reject(adminConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

      let data = await providerDaoV1.searchProviders(params);
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function editPatientStatus
   * @description Block and unblock the status of patient by super admin
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId user's id (required)
   * @param params.status status (required)
   * @returns 
   */
  async editPatientStatus(payload: ProviderRequest.Payload, tokenData: TokenData){
    try{
      const patientColl = encryptedDb.getPatientEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: ProviderRequest.updateStatus = JSON.parse(decryptedData);
      const validation = editPatientStatus.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
      }

      const isProvider = await providerDaoV1.findUserById(tokenData.userId)
      if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

      if(isProvider.status === STATUS.INACTIVE)
        return Promise.reject(MESSAGES.ERROR.BLOCKED);

      const isUser = await providerDaoV1.findOne(patientColl, {_id: toObjectId(params.userId), status: {$ne: STATUS.DELETED}});
      if(!isUser)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

      if(isProvider?.createdBy == USER_TYPE.ADMIN || isProvider?.isMainProvider){
        await patientDaoV1.editPatientStatus(params);
        if (params.status == STATUS.INACTIVE) {
          await this.removeSession(params, true);
          return adminConstant.MESSAGES.SUCCESS.BLOCK_USER;
        } else {
          return adminConstant.MESSAGES.SUCCESS.UNBLOCK_USER;
        }
      }else {
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_PROVIDER);
      }     
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

   /**
   * @function editProvider
   * @description edit the details of provider
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.providerId provider id (required);
   * @returns updated data object
   */
   async editProvider(payload: ProviderRequest.Payload,tokenData:TokenData, headers: any){
    try{
      const patientColl = encryptedDb.getPatientEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: ProviderRequest.EditProvider = JSON.parse(decryptedData);
      const validation = editProvider.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }

      const isProvider = await providerDaoV1.findUserById(params.userId);
      if(!isProvider)return Promise.reject(adminConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

      if(tokenData.userType === USER_TYPE.ADMIN){
        let password;
        if(params.countryCode && params.mobileNo){//NOSONAR
          params.fullMobileNo = params.countryCode + params.mobileNo;
          const isMobileExists = await providerDaoV1.isMobileExists(payload);
          if(isMobileExists)return Promise.reject(adminConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
        }
        if(params.email){
          const isEmailExists = await providerDaoV1.isEmailExists(params);
          if(isEmailExists)return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
          password = passwordGenrator(11);
          params.salt = genRandomString(SERVER.SALT_ROUNDS);
          params.hash = encryptHashPassword(password, params.salt);
        }

        await providerDaoV1.editProvider(params, isProvider);
        if(params.glucoseInterval){
          await providerDaoV1.updateMany(patientColl, {clinicId: isProvider.clinicId, status: {$ne: STATUS.DELETED}}, {glucoseInterval: params.glucoseInterval});
        }
        if(params.email){
          const link= SERVER.PROVIDER_CREDENTIALS.URL;
          let mailData = {
            type: adminConstant.MAIL_TYPE.CREATE_PROVIDER,
            email: params.email,
            name: isProvider.clinicName,
            adminName: params?.adminName || isProvider.adminName,
            password: password,
            contract: isProvider.contract,
            link: link
          }
          mailData = encryptData(JSON.stringify(mailData));
          axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
        }
        let notificationData = {
          type: adminConstant.NOTIFICATION_TYPE.UPDATE_PROVIDER,
          userId: [params.userId],
          platform: headers.platform
        }
        notificationData = encryptData(JSON.stringify(notificationData));
        await this.inAppNotification(notificationData);
        return adminConstant.MESSAGES.SUCCESS.EDIT_CLINIC;
      }
      else{
        return adminConstant.MESSAGES.ERROR.INVALID_USER;
      }
    }
    catch(error){
      logger.error(error);
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
      const provider = await providerDaoV1.findUserById(tokenData.userId);
      if(!provider)return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      const subsDetails = {
        subscriptionType: provider.subscriptionType,
        subscriptionDescription: provider.subscriptionDescription,
        isSubscribed: provider.isSubscribed,
        isMainProvider: provider?.isMainProvider,
        createdBy: provider?.createdBy,
        subscriptionStartDate: provider?.subscriptionStartDate,
        subscriptionEndDate: provider?.subscriptionEndDate
      }
      const count = await notificationDaoV1.countDocuments("notification_lists", {userId: toMongooseObjectId(tokenData.userId), isRead: false});
      let data:any = {}
      data.count = count;
      data.subscriptionDetails = subsDetails;
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.NOTIFCATION_COUNT(data);
    }
    catch(error){
      throw error;
    }
  }

  async getLibraDetails(params:ProviderRequest.Libra) {
    try {
      let region = await redisClient.getValue(`lily_device_region_${params.userId}`);
      region?region:"us";
      console.log('region',region);
      let data = await axiosService.getLibra({"url":`https://api-${region}.libreview.io/glucoseHistory`, "payload": params, "auth": params.token });
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }catch(error) {
      throw error;
    }
  }

  async getDexcomDetails(params: ProviderRequest.Dexcom){
    try{
      const deviceData = await axiosService.get({"url":`https://preprod-dexcom.lilylink.com/glucose/agp`, "payload": params });
      const cgmData = await axiosService.get({"url":`https://preprod-dexcom.lilylink.com/glucose/metrics`, "payload": params });
      let data = {
        data:{
          periods: [
            {
              data:{
                blocks: [deviceData.data],
              }
            }
          ]
        },
        ...cgmData.data
      }
      data = encryptData(JSON.stringify(data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      throw error;
    }
  }

  async getEpicPatientDetails(params, accessToken){
    try{
      let data = await axiosService.getData({"url": SERVER.PATIENT_APP_URL + SERVER.GET_EPIC_USER, "payload": params, "auth": accessToken });
      data = encryptData(JSON.stringify(data.data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      throw error;
    }
  }

  async getEpicPatientDetailsById(params, accessToken){
    try{
      let response = await axiosService.getData({"url": SERVER.PATIENT_APP_URL + SERVER.GET_EPIC_USER_BY_ID, "payload": params, "auth": accessToken });
      response = encryptData(JSON.stringify(response.data));
      return adminConstant.MESSAGES.SUCCESS.DETAILS(response);
    }
    catch(error){
      throw error;
    }
  }
}

export const providerController = new ProviderController();
