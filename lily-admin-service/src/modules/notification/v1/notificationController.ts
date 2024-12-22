"use strict";
import * as _ from "lodash";
import {
  encryptData,
  decryptData,
} from "@utils/appUtils";
import {
  MESSAGES,
  SERVER,
} from "@config/index";
import { logger } from "@lib/logger";
import * as notificationConstant from "@modules/notification/v1/notificationConstant";
import { createNotification, sendNotification, updateNotification } from "@modules/notification/v1/routeValidator";
import {  notificationDaoV1} from "@modules/notification/index";
import { axiosService } from "@lib/axiosService";
import { PLATFORM_TYPE } from "@modules/notification/v1/notificationConstant";

export class NotificationController {

  /**
   * @function createNotification
   * @description create notification 
   * @payload payload contains encrypted data : decrypted params defined below
   * @param  @createNotification routeValidator 
   * @retuns data obj with token
   */
  async createNotification(payload: NotificationRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.Notification = JSON.parse(decryptedData);
      const validation = createNotification.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      const step1= await notificationDaoV1.save("notification",params);
      let step2 = encryptData(JSON.stringify(step1));
      return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_ADDED(step2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function editNotification
   * @description edit notification details with required params
   * @payload payload contains encrypted data : decrypted params defined below
   * @param @updateNotification routeValidator
   * @retuns data obj with token
   */
  async editNotification(payload: NotificationRequest.Payload) {
    try {
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.editNotification = JSON.parse(decryptedData);
      const validation = updateNotification.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }
      let update:any={}
      if(params.title) update.title= params.title;
      if(params.description) update.description= params.description;
      if(params.platform) update.platform= params.platform;
      if(params.isAllUser) update.isAllUser= params.isAllUser;
      if(params.users?.length) update.users= params.users;
      if(params.status) update.status = params.status;
      const step1= await notificationDaoV1.findOneAndUpdate("notification",{_id: params._id},update,{new:true});
      let step2 = encryptData(JSON.stringify(step1));
      return notificationConstant.MESSAGES.SUCCESS.EDIT_NOTIFICATION(step2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

   
  /** 
   * @function getNotification
   * @description get faq details
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params._id: get notification details with id
   * @retuns data obj with token
   */
  async getNotification(params: NotificationRequest.getNotification) {
    try {
      const step1= await notificationDaoV1.findOne("notification",{_id: params._id});
      if(!step1) return Promise.reject(notificationConstant.MESSAGES.ERROR.INVALID_NOTIFI_ID);
      let step2 = encryptData(JSON.stringify(step1));
      return notificationConstant.MESSAGES.SUCCESS.DETAILS(step2);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

    /** 
   * @function notificationListing
   * @description get faq details
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.pageNo: page number listing request for getting faqs
   * @param params.limit: limit faqs for listing
   * @retuns data obj with token
   */
    async notificationListing(params: ListingRequest) {
      try {
        let step1= await notificationDaoV1.getNotificationListing(params);
        let step2 = encryptData(JSON.stringify(step1));
        return notificationConstant.MESSAGES.SUCCESS.DETAILS(step2);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }

    /**
     * @function sendNotification
     * @description send notification to patients and providers
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.notificationId notification id (required)
     * @returns
     */
    async sendNotification(payload: NotificationRequest.Payload, accessToken: string){
      try{
        let decryptedData = decryptData(payload.data);
        if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
        let params: NotificationRequest.sendNotification = JSON.parse(decryptedData);
        const validation = sendNotification.validate(params);
        if (validation.error) {
          return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
        }

        const notificationData = await notificationDaoV1.findOne("notification", {_id: params.notificationId});
        if(notificationData.platform === PLATFORM_TYPE.WEB){
          axiosService.post({ "url": SERVER.PROVIDER_APP_URL + SERVER.SEND_NOTIFICATION_TO_WEB, "body":  payload, "auth": accessToken });
        }
        else if(notificationData.platform === PLATFORM_TYPE.ANDROID || notificationData.platform === PLATFORM_TYPE.IOS){
          axiosService.post({ "url": SERVER.PATIENT_APP_URL + SERVER.SEND_NOTIFICATION_TO_APP, "body":  payload, "auth": accessToken });
        }
        else{
          axiosService.post({ "url": SERVER.PROVIDER_APP_URL + SERVER.SEND_NOTIFICATION_TO_WEB, "body":  payload, "auth": accessToken });
          axiosService.post({ "url": SERVER.PATIENT_APP_URL + SERVER.SEND_NOTIFICATION_TO_APP, "body":  payload, "auth": accessToken });
        }
        return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_SENT;
      }
      catch(error){
        logger.error(error);
        throw error;
      }
    }
}

export const notificationController = new NotificationController();
