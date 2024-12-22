"use strict";

import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS,  LOGIN_TYPE } from "@config/main.constant";
import { logger } from "@lib/logger";

export class AdminDao extends BaseDao {

	/**
	 * @function isEmailExists
	 * @description checks if email or userId exists or not
	 */
	async isEmailExists(params, userId?: string) {
		try {
			const query: any = {};
			query.email = params.email;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			const projection = { updatedAt: 0 };

			return await this.findOne("admins", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function isMobileExists
	 * @description checks if phoneNumber or userId exists or not
	 */
	async isMobileExists(params, userId?: string) {
		try {
			const query: any = {};
			query.countryCode = params.countryCode;
			query.mobileNo = params.mobileNo;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			const projection = { _id: 1 };

			return await this.findOne("admins", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

		/**
	* @function createAdmin
	* @description create the new admin
	*/
	async createAdmin(params: AdminRequest.Create) {
		try {
			return await this.save("admins", params);
		} catch (error) {
			throw error;
		}
	}
	
	/**
	 * @function signUp
	 * @description save new user's data in DB
	 */
	async signUp(params, session?) {
		try {
			return await this.save("admins", params, { session });
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**    
	 * @function findUserById
	 * @description fetch all details of user on basis of _id (userId)
	 */
	async findUserById(userId: string, project = {}) {
		try {
			const query: any = {};
			query._id = userId;
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne("admins", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changePassword 
	 * @description update the hash (password) field in user's Document  
	 */
	async changePassword(params: AdminRequest.ChangeForgotPassword) {
		try {
			const query: any = {};
			query.email = params.email;
			query.status = { "$ne": STATUS.DELETED };
			const update = {};
			update["$set"] = {
				hash: params.hash
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}


	/**    
	* @function updateSocialData
	* @description update the user data if user re-login with some social accounts
	*/
	async updateSocialData(params, existingData) {
		try {
			const query: any = {};
			query['_id'] = existingData._id;
			if (params.name) params['socialData.name'] = params.name;
			if (params.profilePicture) params['socialData.profilePic'] = params.profilePicture;
			params['socialData.socialId'] = params.socialId;
			if(params.email)params['socialData.email'] = params.email;
			if(params.loginType==LOGIN_TYPE.APPLE) params['appleSocialId'] = params.socialId;
			if(params.loginType==LOGIN_TYPE.GOOGLE) params['googleSocialId'] = params.socialId;
		return await this.findOneAndUpdate("admins", query, params, {new: true});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	* @function isUserExists
	* @description checks if the user is already exists
	* @returns return user's data
	*/
	async isSocialIdExists(params, userId?: string) {
		try {
			const query: any = {};
			if(params.loginType==LOGIN_TYPE.APPLE) query['appleSocialId'] = params.socialId;
			if(params.loginType==LOGIN_TYPE.GOOGLE) query['googleSocialId'] = params.socialId;
			query['socialData.socialId'] = params.socialId;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };
			const projection = { updatedAt: 0 };
			return await this.findOne("admins", query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}


	/**    
	* @function updateStatus
	* @description update the admin status
	*/
	async updateStatus(params, existingData) {
		try {
			const query: any = {};
			const dataToUpdate: any = {}
			query['_id'] = existingData._id;
			if (params.status) dataToUpdate['status'] = params.status;
		return await this.findOneAndUpdate("admins", query, dataToUpdate, {new: true});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}
	/**
	 * @function changeProfilePassword
	 * @description change the profile password using old password
	 */
	async changeProfilePassword(params: AdminRequest.ChangePassword, userId){
		try {
			const query: any = {};
			if (userId) query._id = userId
			if (params.email) query.email = params.email;

			const update = {};
			update["$set"] = {
				"hash": params.hash
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changeProfile
	 * @description Edit admin Profile
	 */
	async changeProfile(payload: AdminRequest.ChangeProfile, userId){
		try {
			let dataToSave: any = {};
			if(payload.name){
				dataToSave["name"] = payload.name
			}
			if(payload.profilePicture || payload.profilePicture === ""){
				dataToSave["profilePicture"] = payload.profilePicture
			}
			return await this.updateOne("admins", {"_id": userId}, dataToSave, {new: true});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}
}

export const adminDao = new AdminDao();