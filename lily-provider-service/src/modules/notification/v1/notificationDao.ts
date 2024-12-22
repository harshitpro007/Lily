"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { toMongooseObjectId } from "@utils/appUtils";
import { notification_lists } from "../notificationListModel";

export class NotificationDao extends BaseDao {

    async createNotification(params: any){
        try{
            return await notification_lists.bulkWrite(params);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getNotificationListing
     * @description get the notification listing of patient
     */
    async getNotificationListing(params: ListingRequest, userId: string){
        try{
            const aggPipe = [];
            const match: any = {};
            match.userId = toMongooseObjectId(userId);
            if (Object.keys(match).length) aggPipe.push({ "$match": match });
            let sort = {};
            (params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR	
            aggPipe.push({ "$sort": sort });
            if (params.limit && params.pageNo) {
                const [skipStage, limitStage] = this.addSkipLimit(
                    params.limit,
                    params.pageNo,
                );
                aggPipe.push(skipStage, limitStage);
            }
            const options = { collation: true };
            return await this.fastPaginate("notification_lists", aggPipe, params.limit, params.pageNo, options, true);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function updateNotification
     * @description update the read status of notifications
     */
    async updateNotification(userId: string){
        try{
            await this.updateOne("login_histories", {"userId._id": toMongooseObjectId(userId), isLogin: true}, {notificationCount: 0}, {});
            return await this.updateMany("notification_lists", {userId: toMongooseObjectId(userId), isRead: false}, {isRead: true}, {});
        }
        catch(error){
            throw error;
        }
    }
}

export const notificationDao = new NotificationDao();