import { BaseDao } from "@modules/baseDao/BaseDao";
import { STATUS } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { toObjectId } from "@utils/appUtils";

export class UserDao extends BaseDao {

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

			return await this.findOne("users", query, projection);
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

			return await this.findOne("users", query, projection);
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
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const patientColl = encryptedDb.getPatientEncryptedClient();
			const query: any = {};
			query._id = userId;
			query.status = { "$ne": STATUS.DELETED };
			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };
			let userData =  await patientColl.findOne({_id: toObjectId(userId), status: { "$ne": STATUS.DELETED }});
			let adminData =  await this.findOne("admins", query, projection);
			let provider = await providerColl.findOne({_id: toObjectId(userId), status: { "$ne": STATUS.DELETED }});
			if(userData) return userData;
			else if (adminData) return adminData; // NOSONAR
			else if(provider) return provider;
			
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**    
	* @function updateStatus
	* @description update the user status 
	* @returns
	*/
	async updateStatus(params, existingData) {
		try {
			const query: any = {};
			const dataToUpdate: any = {}
			query['_id'] = existingData._id;
			if (params.status) dataToUpdate['status'] = params.status;
		return await this.findOneAndUpdate("users", query, dataToUpdate, {new: true});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

}

export const userDao = new UserDao();