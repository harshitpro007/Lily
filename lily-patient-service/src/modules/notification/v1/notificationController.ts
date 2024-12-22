"use strict";
import {
  encryptData,
  decryptData,
  toObjectId,
} from "@utils/appUtils";
import {
  DEVICE_TYPE,
  MESSAGES,
  SERVER,
  STATUS,
} from "@config/index";
import { logger } from "@lib/logger";
import * as notificationConstant from "@modules/notification/v1/notifcationConstant";
import { createNotification } from "./routeValidator";
import { notification_lists, notificationDaoV1 } from "..";
import { PLATFORM_TYPE } from "@modules/notification/v1/notifcationConstant";
import { userDaoV1 } from "@modules/user";
import { encryptedDb } from "@utils/DatabaseClient";
import { NOTIFICATION_TYPE } from "@modules/user/v1/userConstant";
import { axiosService } from "@lib/axiosService";
import { login_histories } from "@modules/models";

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
      const userColl = encryptedDb.getUserEncryptedClient();
      let decryptedData = decryptData(payload.data);
      if(!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
      let params: NotificationRequest.Notification = JSON.parse(decryptedData);
      const validation = createNotification.validate(params);
      if(validation.error) {
        return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details));
      }

      const notifactionData = await notificationDaoV1.findOne("notifications", {_id: params.notificationId});
      if(notifactionData.platform === PLATFORM_TYPE.ANDROID && notifactionData.isAllUser === true) {
        const users = await userDaoV1.find(userColl, {platform: DEVICE_TYPE.ANDROID, status: STATUS.ACTIVE},  {projection: {_id: 1}});
        const bulkOperations = await this.getNotificationData(users, notifactionData, PLATFORM_TYPE.ANDROID);
        await notificationDaoV1.createNotification(bulkOperations);
        const userIds = await users.map(user => user._id);
        await this.sendNotification(userIds,notifactionData);
        await login_histories.bulkWrite(
          userIds.map(id => ({
            updateOne: {
              filter: { "userId._id": id, isLogin: true },
              update: { $inc: { notificationCount: 1 } }  // Increment the notification count by 1
            }
          }))
        );
      }
      else if(notifactionData.platform === PLATFORM_TYPE.IOS && notifactionData.isAllUser === true){
        const users = await userDaoV1.find(userColl, {platform: DEVICE_TYPE.IOS, status: STATUS.ACTIVE}, {projection: {_id: 1}});
        const bulkOperations = await this.getNotificationData(users, notifactionData, PLATFORM_TYPE.IOS);
        await notificationDaoV1.createNotification(bulkOperations);
        const userIds = await users.map(user => user._id);
        await this.sendNotification(userIds,notifactionData)
        await login_histories.bulkWrite(
          userIds.map(id => ({
            updateOne: {
              filter: { "userId._id": id, isLogin: true },
              update: { $inc: { notificationCount: 1 } }  // Increment the notification count by 1
            }
          }))
        );
      }
      else if(notifactionData.platform === PLATFORM_TYPE.IOS  && !notifactionData?.isAllUser){
        const bulkOperations = await this.getNotificationData(notifactionData.users, notifactionData,  PLATFORM_TYPE.IOS);
        await notificationDaoV1.createNotification(bulkOperations);
        await this.sendNotification(notifactionData.users,notifactionData)
        await login_histories.bulkWrite(
          notifactionData.users.map(id => ({
            updateOne: {
              filter: { "userId._id": toObjectId(id), isLogin: true },
              update: { $inc: { notificationCount: 1 } }  // Increment the notification count by 1
            }
          }))
        );
      }
      else if(notifactionData.platform === PLATFORM_TYPE.ANDROID && !notifactionData?.isAllUser){
        const bulkOperations = await this.getNotificationData(notifactionData.users, notifactionData, PLATFORM_TYPE.ANDROID);
        await notificationDaoV1.createNotification(bulkOperations);
        await this.sendNotification(notifactionData.users,notifactionData)
        await login_histories.bulkWrite(
          notifactionData.users.map(id => ({
            updateOne: {
              filter: { "userId._id": toObjectId(id), isLogin: true },
              update: { $inc: { notificationCount: 1 } }  // Increment the notification count by 1
            }
          }))
        );
      }
      else if(notifactionData.platform === PLATFORM_TYPE.ALL && notifactionData.isAllUser === true){
        const users = await userDaoV1.find(userColl, {status: STATUS.ACTIVE}, {projection: {_id: 1, platform: 1}});
        const bulkOperations = await this.getNotificationData(users, notifactionData);
        await notificationDaoV1.createNotification(bulkOperations);
        const userIds = await users.map(user => user._id);
        await this.sendNotification(userIds,notifactionData)
        await login_histories.bulkWrite(
          userIds.map(id => ({
            updateOne: {
              filter: { "userId._id": id, isLogin: true },
              update: { $inc: { notificationCount: 1 } }  // Increment the notification count by 1
            }
          }))
        );
      }
      else if(notifactionData.platform === PLATFORM_TYPE.ALL && !notifactionData?.isAllUser){
        const userIds = notifactionData.users.map(userId => toObjectId(userId));
        const users = await userDaoV1.find(userColl, { _id: { $in: userIds }}, { projection: { _id: 1, platform: 1 } });
        const bulkOperations = await this.getNotificationData(users, notifactionData);
        await notificationDaoV1.createNotification(bulkOperations);
        const Ids = await users.map(user => user._id);
        await this.sendNotification(Ids,notifactionData)
        await login_histories.bulkWrite(
          Ids.map(id => ({
            updateOne: {
              filter: { "userId._id": id, isLogin: true },
              update: { $inc: { notificationCount: 1 } }  // Increment the notification count by 1
            }
          }))
        );
      }
      return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_SENT;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async sendNotification(userIds:any, notifactionData:any){
    try{
      let notification = {
        type: NOTIFICATION_TYPE.ADMIN_NOTIFICATION,
        userId: userIds,
        details: {
          title: notifactionData.title,
          description: notifactionData.description
        }
      }
      notification = encryptData(JSON.stringify(notification));
      await this.pushNotification(notification);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  async pushNotification(params){
    try{
      setTimeout(async() => {
        await axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_PUSH_NOTIFICATION, "body": {data: params} });
      }, 500);
    }
    catch(error){
      throw error;
    }
  }

  /**
   * @function getNotificationData
   * @description get the formated notification data
   * @returns 
   */
  async getNotificationData(data: any, notifactionData: any, platform = ""){
    try{
      const bulkOperations = data.map(user => ({
        insertOne: {
          document: {
            userId: user._id ? user._id : toObjectId(user),
            notificationId: notifactionData._id,
            platform: platform || (user?.platform === "1" ? PLATFORM_TYPE.ANDROID : PLATFORM_TYPE.IOS),
            title: notifactionData.title,
            description: notifactionData.description,
            created: Date.now(),
          }
        }
      }));
      return bulkOperations;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
   * @function getNotificationListing
   * @description get the notification listing of user
   * @param params.pageNo page no (required)
   * @param params.limit limit (required)
   * @returns list of notifications
   */
  async getNotificationListing(params: ListingRequest,tokenData: TokenData){
    try{
      let data = await notificationDaoV1.getNotificationListing(params,tokenData.userId)
      data = encryptData(JSON.stringify(data));
      return MESSAGES.SUCCESS.DETAILS(data);
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }

  /**
  * @function updateNotification
  * @description update the read status of notifications
  * @returns
  */
  async updateNotification(tokenData: TokenData){
    try{
      await notificationDaoV1.updateNotification(tokenData.userId);
      return MESSAGES.SUCCESS.READ_NOTIFICATION;
    }
    catch(error){
      logger.error(error);
      throw error;
    }
  }
}

export const notificationController = new NotificationController();
