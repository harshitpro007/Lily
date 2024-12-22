"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { PLATFORM_TYPE, USERS } from "./notificationConstant";
import { STATUS } from "@config/main.constant";
export class NotificationDao extends BaseDao {

	/**
	 * @function getNotificationListing
	 * @description get the listing of notification
	 */
	async getNotificationListing(params: ListingRequest) {
		try {
			const aggPipe = [];
			const match: any = {};
			match.status = { "$in": [STATUS.ACTIVE, STATUS.INACTIVE] }
			if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };
			if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };
			if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };
			if (params.platforms) match.platform = params.platforms;
			if (params.users) {
				if (params.users == USERS.ALL) {
					match.platform = PLATFORM_TYPE.ALL;
				}
				if (params.users == USERS.CLINIC) {
					match.platform = PLATFORM_TYPE.WEB;
				}
				if (params.users == USERS.PATIENTS) {
					match.platform = { "$in": [PLATFORM_TYPE.ANDROID, PLATFORM_TYPE.IOS] };
				}
			}
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
			return await this.fastPaginate("notification", aggPipe, params.limit, params.pageNo, options, true);
		} catch (error) {
			throw error;
		}
	}
}

export const notificationDao = new NotificationDao();