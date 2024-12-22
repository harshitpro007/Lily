"use strict";
import { SERVER } from "@config/environment";
import { DEVICE_TYPE, ENVIRONMENT, MAIL_TYPE, MESSAGES, NOTIFICATION, PLATFORM, STATUS, TIMERS } from "@config/main.constant";
import { mailManager } from "@lib/MailManager";
import { twilioMsg } from "@lib/twilio";
import { emailTemplate, message, sendNotification } from "@modules/admin/v1/routeValidator";
import { decryptData, encryptData, toObjectId } from "@utils/appUtils";
import { notificationDaoV1 } from "..";
import { fireBase } from "@lib/firebase";
import { login_histories } from "@modules/loginHistory";
import { logger } from "@lib/logger";
export class NotificationController {

  /**
   * @function emailHandler
   * @description this method is use to send the mail
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.type mail type(required)
   * @returns 
   */
  async emailHandler(payload: NotificationRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.Mail = JSON.parse(decryptedData);
      const validation = emailTemplate.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      if (SERVER.ENVIRONMENT === ENVIRONMENT.DEV) {
        params.privacyPolicy = SERVER.LINKS.DEV.PRIVACY_POLICY
        params.termsAndConditions = SERVER.LINKS.DEV.TERMS_AND_CONDITIONS
      }
      if (SERVER.ENVIRONMENT === ENVIRONMENT.STAGING) {
        params.privacyPolicy = SERVER.LINKS.STAGING.PRIVACY_POLICY
        params.termsAndConditions = SERVER.LINKS.STAGING.TERMS_AND_CONDITIONS
      } 
      if(SERVER.ENVIRONMENT === ENVIRONMENT.PREPROD) {
        params.privacyPolicy = SERVER.LINKS.PREPROD.PRIVACY_POLICY
        params.termsAndConditions = SERVER.LINKS.PREPROD.TERMS_AND_CONDITIONS
      }
      if(SERVER.ENVIRONMENT === ENVIRONMENT.PRODUCTION) {
        params.privacyPolicy = SERVER.LINKS.PRODUCTION.PRIVACY_POLICY
        params.termsAndConditions = SERVER.LINKS.PRODUCTION.TERMS_AND_CONDITIONS
      }
      switch (params.type) {
        case MAIL_TYPE.FORGOT_PASSWORD_LINK:
          await mailManager.forgotPasswordMail(params);
          break;
        case MAIL_TYPE.CREATE_PROVIDER:
          await mailManager.providerMail(params);
          break;
        case MAIL_TYPE.VERIFY_EMAIL:
          await mailManager.verifyEmail(params);
          break;
        case MAIL_TYPE.FORGOT_PASSWORD:
          await mailManager.forgotPatientPasswordMail(params);
          break;
        case MAIL_TYPE.WELCOME_MAIL:
          await mailManager.welcomeEmail(params);
          break;
        case MAIL_TYPE.CONTACT_US:
          await mailManager.contactUs(params);
          break;
        case MAIL_TYPE.RESET_PASSWORD:
          await mailManager.passwordMail(params);
          break;
        case MAIL_TYPE.ADD_PROVIDER:
          await mailManager.addProviderMail(params);
          break;
        case MAIL_TYPE.GLUCOSE_DATA:
          await mailManager.glucoseDataMail(params);
          break;
        case MAIL_TYPE.ACCOUNT_DEACTIVATE:
          await mailManager.deactivateAccount(params);
          break;
        case MAIL_TYPE.ACCOUNT_ACTIVATE:
          await mailManager.activateAccount(params);
          break;
        case MAIL_TYPE.SUBSCRIPTION:
          await mailManager.subscription(params);
          break;
        case MAIL_TYPE.CLOSE_TICKET:
          await mailManager.closeTicket(params);
          break;  
        case MAIL_TYPE.EMAIL_NOTIFICATION:
          await mailManager.emailNotification(params);
          break;   
        default:
          return Promise.reject(MESSAGES.ERROR.INVALID_MAIL_TYPE);
      }

      return MESSAGES.SUCCESS.MAIL_SENT;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function sendMessage
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.body body content(required)
   * @param params.to receiver mobile(required)
   * @returns 
   */
  async sendMessage(payload: NotificationRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.Message = JSON.parse(decryptedData);
      const validation = message.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }
      console.log("$$$$$$$$$$$", params)
      await twilioMsg.sendMessage(params)
      return MESSAGES.SUCCESS.MAIL_SENT;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @function sendNotification
   * @payload payload contains encrypted data : decrypted params defined below
   * @description send notification to the users
   * @param params.userId user id(required)
   * @returns 
   */
  async sendNotification(payload: NotificationRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.Notification = JSON.parse(decryptedData);
      const validation = sendNotification.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      if (params.platform === DEVICE_TYPE.ANDROID) {
        params.platform = PLATFORM.ANDROID
      }
      else if (params.platform === DEVICE_TYPE.IOS) {
        params.platform = PLATFORM.IOS
      }
      else {
        params.platform = PLATFORM.WEB
      }
      let notificationData = NOTIFICATION(params.type, params);
      await notificationDaoV1.sendNotificationsToUsers(params, notificationData);
      setTimeout(async () => {
        await this.sendPushNotification(payload);
      }, TIMERS.HALF_SECOND);
      await login_histories.bulkWrite(
        params.userId.map(id => ({
          updateOne: {
            filter: { "userId._id": toObjectId(id), isLogin: true },
            update: { $inc: { notificationCount: 1 } } 
          }
        }))
      );
      return MESSAGES.SUCCESS.NOTIFICATION_SENT;
    }
    catch (error) {
      throw error;
    }
  }

  /**
   * @function sendPushNotification
   * @payload payload contains encrypted data : decrypted params defined below
   * @description send push notification to the users
   * @param params.userId user id(required)
   * @returns 
   */
  async sendPushNotification(payload: NotificationRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.Notification = JSON.parse(decryptedData);
      const validation = sendNotification.validate(params);
      if (validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
      }

      console.log(params.userId);
      let notificationData = NOTIFICATION(params.type, params);
      const query = {
        "userId._id": { $in: params.userId },
        "userId.status": STATUS.ACTIVE,
        "isLogin": true
      };
      let tokens = [],notification:any, data:any, emails=[], privacyPolicy,termsAndConditions;
      if (SERVER.ENVIRONMENT === ENVIRONMENT.DEV) {
        privacyPolicy = SERVER.LINKS.DEV.PRIVACY_POLICY
        termsAndConditions = SERVER.LINKS.DEV.TERMS_AND_CONDITIONS
      }
      if (SERVER.ENVIRONMENT === ENVIRONMENT.STAGING) {
        privacyPolicy = SERVER.LINKS.STAGING.PRIVACY_POLICY
        termsAndConditions = SERVER.LINKS.STAGING.TERMS_AND_CONDITIONS
      }
      if(SERVER.ENVIRONMENT === ENVIRONMENT.PREPROD) {
        privacyPolicy = SERVER.LINKS.PREPROD.PRIVACY_POLICY
        termsAndConditions = SERVER.LINKS.PREPROD.TERMS_AND_CONDITIONS
      }
      if(SERVER.ENVIRONMENT === ENVIRONMENT.PRODUCTION) {
        privacyPolicy = SERVER.LINKS.PRODUCTION.PRIVACY_POLICY
        termsAndConditions = SERVER.LINKS.PRODUCTION.TERMS_AND_CONDITIONS
      }
      const userToken = login_histories.find(query, { userId: 1, deviceToken: 1, platform: 1, isLogin: 1,notificationCount:1 }).cursor({ "batchSize": SERVER.CHUNK_SIZE });
      notification = {
        title: notificationData.title,
        body: notificationData.body
      };
      userToken.on("data", async (doc) => {
        // console.log(doc, ':::::::::::::::::');
        const deviceToken = doc.deviceToken;
        const email= doc.userId?.email;
        tokens.push(deviceToken)
        emails.push(email);
        if (deviceToken !== undefined && doc.isLogin) {
          let count= doc.notificationCount?doc.notificationCount:0;                      
          data = {
            type: params.type,
            badge: String(count)
          };
        }        
      });      
      userToken.on("error", async (error) => {
        logger.error(`sendPushNotification cursor error`, error);
      });
      userToken.on("end", async () => {
        setTimeout(async ()=> {
          console.log('****************notification****************',notification, "*****************emails",emails);
          await fireBase.multiCastPayload(tokens, notification, data);  
          for(let i=0;i<emails.length;i++) {
            if(emails[i]!=undefined &&  emails[i]!=="" && emails[i]!="undefined") {
              let mailData:any = {
                type: MAIL_TYPE.EMAIL_NOTIFICATION,
                email: emails[i],
                title: notificationData.title,
                description: notificationData.body,
                privacyPolicy: privacyPolicy,
                termsAndConditions: termsAndConditions
              }
              await mailManager.emailNotification(mailData);
            }          
          }         
        },TIMERS.TWO_SECOND)
      });
      return MESSAGES.SUCCESS.NOTIFICATION_SENT;    
    }
    catch (error) {
      throw error;
    }
  }
}

export const notificationController = new NotificationController();
