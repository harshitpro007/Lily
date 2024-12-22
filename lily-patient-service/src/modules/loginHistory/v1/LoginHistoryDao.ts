import { BaseDao } from "@modules/baseDao/BaseDao";
import { logger } from "@lib/logger";

export class LoginHistoryDao extends BaseDao {

	/**
	 * @function findDeviceLastLogin
	 */
	async findDeviceLastLogin(params) {
		try {
			const query: any = {};
			query["userId._id"] = params.userId;
			if (params.deviceId) query.deviceId = params.deviceId;
			query.isLogin = false;

			const projection = { lastLogin: 1 };
			const sort = { created: -1 };

			const response = await this.findOne("login_histories", query, projection, {}, sort);
			return response ? response.lastLogin : "";
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function createUserLoginHistory
	 */
	async createUserLoginHistory(params, session?) {
		try {
			const loginHistory: LoginHistoryRequest = {
				"userId": {
					"_id": params.userId || params["_id"],
					"isApproved": params?.isApproved,
					"name": params?.name,
					"email": params?.email,
					"countryCode": params?.countryCode,
					"mobileNo": params?.mobileNo,
					"pushNotificationStatus": params.pushNotificationStatus ? params.pushNotificationStatus : false,
					"groupaNotificationStatus": params.groupaNotificationStatus ? params.pushNotificationStatus : false,
					"userType": params.userType,
					"status": params.status
				},
				"deviceId": params.deviceId,
				"remoteAddress": params?.remoteAddress || "" ,
				"platform": params.platform,
				"deviceToken": params.deviceToken,
				"salt": params.salt,
				"lastLogin": Date.now(),
				"location": (params?.location && params?.location["status"]) === "success" ? params.location : {}//NOSONAR
			};
			if (params?.location && params?.location["status"]) loginHistory.timezone = params?.location["timezone"];//NOSONAR
			return await this.save("login_histories", loginHistory, { session });
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

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

			const projection = { salt: 1, lastLogin: 1, deviceId: 1, platform: 1 ,_id:0};

			return await this.findOne("login_histories", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	* @function findLoginDevices
	*/
	async findLoginDevices(params) {
		try {
			const query: any = {};
			query["userId._id"] = params.userId;
			query.isLogin = true;

			const projection = { lastLogin: 1, deviceId: 1, platform: 1 };

			return await this.find("login_histories", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	async activeLoginCount(params){
		try {
			const query: any = {};
			query["userId._id"] = params.userId;
			query.isLogin = true;

			return await this.countDocuments("login_histories", query);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}
}

export const loginHistoryDao = new LoginHistoryDao();