import { BaseDao } from "@modules/baseDao/BaseDao";
import { logger } from "@lib/logger";

export class LoginHistoryDao extends BaseDao {




	/**
	 * @function removeDeviceById
	 */
	async removeDeviceById(params) {
		try {
			const query: any = {};
			query["userId._id"] = params.userId;
			if (params.deviceId) query.deviceId = params.deviceId;
			query.isLogin = true;

			const update = {};
			update["$set"] = {
				"isLogin": false
			};
			update["$unset"] = { deviceToken: "" };

			const options = { multi: true };

			return await this.updateMany("login_histories", query, update, options);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function findDeviceById
	 */
	async findDeviceById(params) {
		try {
			const query: any = {};
			query.deviceId = params.deviceId;
			query["userId._id"] = params.userId;
			if (params.salt) query.salt = params.salt;
			query.isLogin = true;

			const projection = { salt: 1, lastLogin: 1, deviceId: 1, platform: 1, _id:0 };

			return await this.findOne("login_histories", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

}

export const loginHistoryDao = new LoginHistoryDao();