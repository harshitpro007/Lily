"use strict";
import { BaseDao } from "@modules/baseDao";
import { toObjectId } from "@utils/appUtils";
import { notification_lists } from "../notificationListModel";

export class NotificationDao extends BaseDao {

	/**
     * @function sendNotificationsToUsers
     */
    async sendNotificationsToUsers(params: NotificationRequest.Notification, notificationData: any) {
        try {
            const bulkOperations = params.userId.map(id => ({
                insertOne: {
                  document: {
                    userId: toObjectId(id),
                    platform: params.platform,
                    title: notificationData.title,
                    description: notificationData.message,
                    created: Date.now(),
                  }
                }
            }));
            return await notification_lists.bulkWrite(bulkOperations);
        } catch (error) {
            throw error;
        }
    }
}

export const notificationDao = new NotificationDao();