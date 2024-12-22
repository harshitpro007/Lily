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
} from "@utils/appUtils";
import {
  JOB_SCHEDULER_TYPE,
  STATUS,
  TOKEN_TYPE,
  SERVER,
  MESSAGES,
  ENVIRONMENT,
  NOTIFICATION_TYPE,
  MAIL_TYPE,
  TIMERS,
} from "@config/index";
import * as adminConstant from "@modules/admin/v1/adminConstant";
import { adminDaoV1 } from "@modules/admin/index";
import { baseDao } from "@modules/baseDao/index";
import { loginHistoryDao } from "@modules/loginHistory/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { logger } from "@lib/logger";
import { axiosService } from "@lib/axiosService";
import * as AWS from "aws-sdk"
import { adminLogin, blockUnblock, changePassword, changeProfile, editProvider, forgotPassword, preSignedUrl, provider, resetPassword, sentInvite, Ticket} from "./routeValidator";

export class AdminController {
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
   * @function login
   * @description login for admin via email & pass with deviceId and device Token 
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.password: user's password (required)
   * @param params.deviceId: device id (required)
   * @param params.deviceToken: device token (required)
   * @retuns data obj with token
   */
  async login(headers:any, payload: AdminRequest.Payload, remoteAddress:string) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.Login = JSON.parse(decryptedData);
      const validation = adminLogin.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      params.remoteAddress = remoteAddress;
      const step1 = await adminDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status === STATUS.BLOCKED)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      const isPasswordMatched = await matchPassword(params.password,step1.hash,step1.salt);
      if (!isPasswordMatched)
        return Promise.reject(adminConstant.MESSAGES.ERROR.INCORRECT_PASSWORD);
      else {
        await this.removeSession(
          { userId: step1._id, deviceId: params.deviceId },
          true
        );

        const salt = crypto.randomBytes(64).toString("hex");
        const tokenData = {
          userId: step1._id,
          deviceId: params.deviceId,
          accessTokenKey: salt,
          type: TOKEN_TYPE.ADMIN_LOGIN,
          userType: step1.userType,
        };
        const encryptedTokenData = encryptData(JSON.stringify(tokenData));
        let authToken = await axiosService.postData({ "url": process.env.AUTH_APP_URL + SERVER.CREATE_AUTH_TOKEN, "body": { data: encryptedTokenData } })
        const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
        const [accessToken] = await promise.join(
          authToken.data,
          loginHistoryDao.createUserLoginHistory({...params,...headers,...step1,salt,location,})
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
          userId: step1._id,
          email: step1.email,
          userType: step1.userType,
          name: step1?.name,
          profilePicture: step1?.profilePicture,
        }
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
   * @description send verification link on email when user forget their password
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @returns
   */
  async forgotPassword(payload:AdminRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.ForgotPassword = JSON.parse(decryptedData);
      const validation = forgotPassword.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      const step1 = await adminDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      else if (step1.status === STATUS.BLOCKED)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      const otp_count: any = await redisClient.getValue(
				`${step1._id}.attempt`
			);
			if (otp_count && JSON.parse(otp_count).count > adminConstant.LIMIT.SEND_OTP_LIMIT)
				return Promise.reject(MESSAGES.ERROR.LIMIT_EXCEEDS);
      if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(`${step1._id}.key`, SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000, JSON.stringify({ email: step1.email })); // NOSONAR
      let mailData = {
        type: adminConstant.MAIL_TYPE.FORGOT_PASSWORD_LINK,
        email: params.email,
        name: step1.name,
        link: SERVER.ADMIN_CREDENTIALS.URL + SERVER.ADMIN_END_POINTS.FOR_GOT_PASSWORD + step1._id,
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
   * @description update user new password in after forgot password
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.email: user's email (required)
   * @param params.newPassword: new password
   * @param params.confirmPassword: confirmation of new password
   * @returns
   */
  async resetPassword(payload: AdminRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.ChangeForgotPassword = JSON.parse(decryptedData);
      const validation = resetPassword.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      if (params.newPassword !== params.confirmPassword)
        return Promise.reject(adminConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH);
      let data: any = await redisClient.getValue(`${params.encryptedToken}.key`);
      data = JSON.parse(data)
      if (!data || data == null) return Promise.reject(adminConstant.MESSAGES.ERROR.TOKEN_EXPIRED);
      let email = data.email;
      const step1 = await adminDaoV1.isEmailExists({ email: email }); // check is email exist if not then restrict to send forgot password mail
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      params.email = email;
      params.hash = encryptHashPassword(params.newPassword, step1.salt);
      await adminDaoV1.changePassword(params);
      redisClient.deleteKey(`${step1._id}.attempt`);
      redisClient.deleteKey(`${params.encryptedToken}.key`);
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
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId user's ID (optional)
   * @returns User's details obj
   */
  async profile(tokenData: TokenData) {
    try {
      let step1 = await adminDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      
      step1 = encryptData(JSON.stringify(step1));
      return adminConstant.MESSAGES.SUCCESS.PROFILE(step1);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function updateStatus
   * @description update user's status Active/Inactive
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.userId: user's ID (required)
   * @param params.status: user's new status (required)
   * @returns
   */
  async updateStatus(payload: AdminRequest.Payload,accessToken:string) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.updateStatus = JSON.parse(decryptedData);
      const validation = blockUnblock.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }

      await axiosService.patchData({ "url": SERVER.PROVIDER_APP_URL + SERVER.BLOCK_UNBLOCK_PROVIDER, "body":  payload, "auth": accessToken });
      if (params.status == STATUS.INACTIVE) {
        return adminConstant.MESSAGES.SUCCESS.BLOCK_USER;
      } else {
        return adminConstant.MESSAGES.SUCCESS.UNBLOCK_USER;
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function changePassword
   * @description Change admin's password
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.oldPassword admin's old password (required)
   * @param params.newPassword admin's new Password (required)
   * @returns 
   */
  async changePassword(params, tokenData) {
    try {
      let decryptedData = decryptData(params.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let payload: AdminRequest.ChangePassword = JSON.parse(decryptedData);
      const validation = changePassword.validate(payload);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      const step1 = await adminDaoV1.findUserById(tokenData.userId, { salt: 1, hash: 1 });
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      if (payload.confirmPassword) {
        if (payload.newPassword != payload.confirmPassword) {
          return adminConstant.MESSAGES.ERROR.PASSWORD_DOESNT_MATCH;
        }
      }
      if (payload.oldPassword == payload.newPassword) return Promise.reject(adminConstant.MESSAGES.ERROR.SAME_PASSWORD)
      const oldHash = encryptHashPassword(payload.oldPassword, step1.salt);
      if (oldHash != step1.hash) return Promise.reject(MESSAGES.ERROR.INVALID_OLD_PASSWORD);
      payload["hash"] = encryptHashPassword(payload.newPassword, step1.salt);
      const result = await adminDaoV1.changeProfilePassword(payload, tokenData.userId);
      if (!result.acknowledged) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG);
      await this.removeSession(tokenData, true);
      return MESSAGES.SUCCESS.CHANGE_PASSWORD;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function changeProfile
   * @description Edit Admin's profile
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.name admin's name (optional)
   * @param params.profilePicture admin's profile pic (optional)
   * @returns 
   */
  async changeProfile(payload: AdminRequest.Payload, tokenData: TokenData) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.ChangeProfile = JSON.parse(decryptedData);
      const validation = changeProfile.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      if (params.name === "") return Promise.reject(adminConstant.MESSAGES.ERROR.EMPTY_NAME);
      const step1 = await adminDaoV1.findUserById(tokenData.userId);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.USER_NOT_FOUND);
      const result = await adminDaoV1.changeProfile(params, tokenData.userId);
      if (!result.acknowledged) return Promise.reject(MESSAGES.ERROR.SOMETHING_WENT_WRONG);
      return adminConstant.MESSAGES.SUCCESS.EDIT_PROFILE;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function encrypt
   * @description Encrypt the request payload
   * @returns encrypted playload object
   */
  async encrypt(payload:any) {
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
  async decrypt(payload: AdminRequest.decrypt) {
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
   * @param params.email etc remaining keys will contains provider model
   * @returns
   */
  async createProvider(payload: AdminRequest.Payload, accessToken){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: AdminRequest.CreateProvider = JSON.parse(decryptedData);
      const validation = provider.validate(params);
      if(validation.error) {
        console.log("Error in validation: ", validation.error.details);
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details)); //NOSONAR
      }

      await axiosService.post({ "url": SERVER.PROVIDER_APP_URL + SERVER.CREATE_PROVIDER, "body":  payload, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.CLINIC_CREATED;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getProviderListing
   * @description Get the providers listing
   * @returns data provider listing array
   */
  async getProviderListing(query: AdminRequest.ProviderListing, accessToken){
    try {
      let data = await axiosService.getData({"url":SERVER.PROVIDER_APP_URL + SERVER.GET_PROVIDERS, "payload": query, auth: accessToken });
      return MESSAGES.SUCCESS.LIST(data);
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
	async preSignedURL(payload: AdminRequest.Payload,tokenData: TokenData) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.PreSignedUrl = JSON.parse(decryptedData);
      const validation = preSignedUrl.validate(params);
      if (validation.error) {
        console.log("Error in validation: ", validation.error.details);
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      const ENVIRONMENT1 = process.env.NODE_ENV.trim();
      const ENVIRONMENT2 = [ENVIRONMENT.DEV, ENVIRONMENT.QA, ENVIRONMENT.LOCAL]
      if (ENVIRONMENT2.includes(ENVIRONMENT1)) {
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
        Expires: adminConstant.PRESIGNED_URL.EXPIRATION, // URL expiration time in seconds
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
   * @function providerProfile
   * @description Get the provider profile using provider or clinicId
   * @param params.userId provider Id (required)
   * @param accessToken admin's access token (required)
   * @returns return the encrypted data object
   */
  async providerProfile(params: UserId, accessToken: string){
    try{
      let data = await axiosService.getData({"url":SERVER.PROVIDER_APP_URL + SERVER.PROVIDER_PROFILE, "payload": params, "auth": accessToken });
      return MESSAGES.SUCCESS.DETAILS(data.data);
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
  async resendInvite(payload: AdminRequest.Payload, accessToken: string){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
      let params: AdminRequest.SentInvite = JSON.parse(decryptedData);
      const validation = sentInvite.validate(params);
      if(validation.error) {
        console.log("Error in validation: ", validation.error.details);
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details)); //NOSONAR
      }

      await axiosService.post({ "url": SERVER.PROVIDER_APP_URL + SERVER.SEND_INVITE, "body":  payload, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.INVITE_SENT;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function verifyLink
   * @description verify the token of forgot password 
   * @param params.token token (required)
   * @returns 
   */
  async verifyLink(params: AdminRequest.VerifyLink){
    try{
      let data: any = await redisClient.getValue(`${params.token}.key`);
      data = JSON.parse(data)
      if (!data || data == null) return Promise.reject(adminConstant.MESSAGES.ERROR.TOKEN_EXPIRED);

      return adminConstant.MESSAGES.SUCCESS.VALID_TOKEN;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

/**
 * @function ticketListing
 * @description ticket listing details for admin section
 * @payload payload contains encrypted data : decrypted params defined below
 * @param params pagintion params for ticket listing
 * @param accessToken (required)
 * @returns 
 */
  async ticketListing(payload: ListingRequest, accessToken: string){
    try{  
      payload.isAdmin= true;
      let data=await axiosService.getData({ "url": SERVER.PROVIDER_APP_URL + SERVER.TICKET_LISTING, "payload":  payload, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.LIST(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

   /**
   * @function ticketDetails
   * @description ticket details
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params._id id ticket details (required)
   * @param accessToken (required)
   * @returns 
   */
  async ticketDetails(payload: ListingRequest, accessToken: string){
    try{  
      let data=await axiosService.getData({ "url": SERVER.PROVIDER_APP_URL + SERVER.TICKET_DETAILS, "payload":  payload, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.DETAILS(data.data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }


  /**
   * @function ticketStatus
   * @description update user's status Active/Inactive
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params._id: user's ID (required)
   * @param params.status: user's new status (required)
   * @returns
   */
  async ticketStatus(payload: AdminRequest.Payload,accessToken:string) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.TicketStatus = JSON.parse(decryptedData);
      const validation = Ticket.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }

      let data = await axiosService.putData({ "url": SERVER.PROVIDER_APP_URL + SERVER.TICKET_STATUS, "body":  payload, "auth": accessToken });
      if(data?.data) {
        let details:any = JSON.parse(decryptData(data.data));
        let platform= await loginHistoryDao.findUserPlatform(details.userId);
        let notificationData:any = {
          type: NOTIFICATION_TYPE.CLOSE_TICKET,
          userId: [details.userId],
          details: details,
          platform: platform?platform.platform:undefined
        }
        let mailData:any = {
          type: MAIL_TYPE.CLOSE_TICKET,
          email: details.email,
          requestNo: details.requestNo
        }
        notificationData= encryptData(JSON.stringify(notificationData));
        mailData= encryptData(JSON.stringify(mailData));
        await this.notifiyUser(notificationData,mailData);
        return adminConstant.MESSAGES.SUCCESS.TICKET_CLOSED(data?.data);      
      }else {
        return adminConstant.MESSAGES.ERROR.INTERNAL_SERVER_ERROR;      
      }
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async notifiyUser(notificationData:any,mailData:any){
    try{
      setTimeout(async() => {
        await axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": {data: notificationData} });
        await axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData }});
      }, TIMERS.HALF_SECOND);
    }
    catch(error){
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
  async editProvider(payload: AdminRequest.Payload,accessToken:string){
    try{
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: AdminRequest.EditProvivder = JSON.parse(decryptedData);
      const validation = editProvider.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }

      let data = await axiosService.putData({ "url": SERVER.PROVIDER_APP_URL + SERVER.EDIT_CLINIC, "body":  payload, "auth": accessToken });
      return adminConstant.MESSAGES.SUCCESS.EDIT_CLINIC;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }
}

export const adminController = new AdminController();
