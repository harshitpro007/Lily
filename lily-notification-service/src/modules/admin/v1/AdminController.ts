"use strict";
import * as _ from "lodash";
import * as crypto from "crypto";
import * as promise from "bluebird";
import {
  buildToken,
  getRandomOtp,
  getLocationByIp,
  matchOTP,
  encryptData,
} from "@utils/appUtils";
import {
  JOB_SCHEDULER_TYPE,
  STATUS,
  TOKEN_TYPE,
  SERVER,
} from "@config/index";
import * as adminConstant from "@modules/admin/v1/adminConstant";
import { adminDaoV1 } from "@modules/admin/index";
import { baseDao } from "@modules/baseDao/index";
import { loginHistoryDao } from "@modules/loginHistory/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { createToken } from "@lib/tokenManager";
import { mailManager } from "@lib/MailManager";
import { logger } from "@lib/logger";

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
   * @function sendOTP
   * @description send/resend otp on email/phone number
   * @param params.type
   * @param params.email: user's email (required)
   * @param params.mobileNo (optional)
   * @returns
   */
  async sendOTP(params: AdminRequest.SendOtp) {
    try {
      const step1 = await adminDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status === STATUS.BLOCKED)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      const otp = getRandomOtp(5).toString();
      let otpLimitCount = 1;
      console.log(otp);
      if (params.type === "EMAIL") {
        let step2: any = await redisClient.getValue(params.email);
        if (step2) {
          otpLimitCount = await this.restrictOTP(step2, otpLimitCount);
        }
        if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(params.email, SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000, JSON.stringify({ email: params.email, otp: otp, count: otpLimitCount }));
        mailManager.forgotPasswordMail({ email: params.email, otp });
      } else {
        const isExist = await adminDaoV1.isMobileExists({ countryCode: "61", ...params }, step1._id);
        if (isExist)
          return Promise.reject(adminConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);

        await baseDao.updateOne(
          "admins",
          { email: params.email },
          {
            $set: {
              countryCode: "61",
              mobileNo: params.mobileNo,
              fullMobileNo: "61" + params.mobileNo,
            },
          },
          {}
        );
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            "61" + params.mobileNo,
            SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_MOBILE / 1000,
            JSON.stringify({
              countryCode: "61",
              mobileNo: params.mobileNo,
              otp: otp,
            })
          );
      }
      return adminConstant.MESSAGES.SUCCESS.SEND_OTP;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function verifyOTP
   * @description verify otp on forgot password/verify number
   * @param params.type
   * @param params.email: user's email (required)
   * @param params.mobileNo
   * @param params.otp: otp (required)
   * @param params.deviceId
   * @param params.deviceToken
   * @returns accessToken and data obj
   */
  async verifyOTP(params: AdminRequest.VerifyOTP) {
    try {
      const step1 = await adminDaoV1.isEmailExists(params);
      if (!step1) return Promise.reject(adminConstant.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
      if (step1.status == STATUS.BLOCKED)
        return Promise.reject(adminConstant.MESSAGES.ERROR.BLOCKED);
      let step2;
      if (params.type === "EMAIL") {
        step2 = await redisClient.getValue(params.email);
      } else {
        step2 = await redisClient.getValue("61" + params.mobileNo);
      }

      const isOTPMatched = await matchOTP(params.otp, step2);
      if (!isOTPMatched) {
        let count = 1;
        let invlidOTPcount: any = await redisClient.getValue(
          `${step1._id.toString()}`
        );
        if (invlidOTPcount) {
          if (invlidOTPcount >= process.env.INVALID_OTP_COUNT) {
            await adminDaoV1.updateOne("admins", { _id: step1._id }, { status: STATUS.BLOCKED }, {});
            await loginHistoryDao.updateMany("login_histories", { "userId._id": step1._id, "isLogin": true }, { "isLogin": false }, {})
            const payload1 = {
              jobName: JOB_SCHEDULER_TYPE.TEMPORARY_ACCOUNT_BLOCKED,
              time:
                new Date(Date.now()).getTime() +
                SERVER.TOKEN_INFO.EXPIRATION_TIME.BLOCKED_ACCOUNT,
              data: { userId: step1._id },
            };
            redisClient.createJobs(payload1);
          }
          count = parseInt(invlidOTPcount) + 1;
        }
        redisClient.setExp(
          `${step1._id.toString()}`,
          SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000,
          count
        );
        return Promise.reject(adminConstant.MESSAGES.ERROR.INVALID_OTP);
      }
      let encEmail = await encryptData(params.email);
      if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(encEmail, SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000, JSON.stringify({ email: step1.email }));

      let dataToReturn = {};

      if (params.type === "MOBILE") {
        await baseDao.updateOne(
          "admins",
          { email: params.email },
          { $set: { isMobileVerified: true } },
          {}
        );

        const salt = crypto.randomBytes(64).toString("hex");
        const tokenData = {
          userId: step1._id,
          deviceId: params.deviceId,
          accessTokenKey: salt,
          type: TOKEN_TYPE.USER_LOGIN,
          userType: step1.userType,
        };
        const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
        const [accessToken] = await promise.join(
          createToken(tokenData),
          loginHistoryDao.createUserLoginHistory({
            ...params,
            ...step1,
            salt,
            location,
          })
        );
        if (SERVER.IS_REDIS_ENABLE)
          redisClient.setExp(
            `${step1._id.toString()}.${params.deviceId}`,
            Math.floor(
              SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000
            ),
            JSON.stringify(buildToken({ ...step1, ...params, salt }))
          );

        dataToReturn = {
          accessToken,
          userId: step1._id,
          email: step1.email,
          userType: step1.userType,
          mobileNo: step1?.mobileNo,
          profilePicture: "",
        };
      }
      dataToReturn["encEmail"] = encEmail;
      return adminConstant.MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async restrictOTP(params, count) {
    try {
      let step1 = JSON.parse(params);
      let otpLimitCount = count + step1.count;
      if (otpLimitCount > +process.env.MAX_OTP_LIMIT)
        return Promise.reject(adminConstant.MESSAGES.ERROR.EXCEED_OTP_LIMIT);
      return otpLimitCount;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}

export const adminController = new AdminController();
