import { STATUS, USER_TYPE } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { toObjectId } from "@utils/appUtils";
export class SubscriptionDao extends EncryptionBaseDao {

	/**
	 * @function isEmailExists
	 * @description checks if email or userId exists or not
	 */
	async isEmailExists(params, userId?: string) {
		try {
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query.email = params.email;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			return await this.findOne(collection, query);
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
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query.fullMobileNo = params.fullMobileNo;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			return await this.findOne(collection, query);
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
			query._id = toObjectId(userId)
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { created: 0, updated: 0 };
			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOne(collection, query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function isClinicExists
	 * @description check is clinic exist or not
	 * @param clinicId 
	 */
	async isClinicExists(clinicId:string, project = {}){
		try{
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query.clinicId = clinicId;
			query.createdBy = USER_TYPE.ADMIN;
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { created: 0, updated: 0 };
			return await this.findOne(collection, query, projection);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function addSubscription
	 * @description add subcription of the clinic
	 */
	async addSubscription(params: SubscriptionRequest.addSubscription){
		try{
			const collection = encryptedDb.getsubscriptionEncryptedClient();
			const query = {
				clinicId: params.clinicId
			}
			return await this.findOneAndUpdate(collection,query,params, {upsert: true});
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getSubscriptionDetails
	 * @description get the details of clinic subscription 
	 */
	async getSubscriptionDetails(params: SubscriptionRequest.SubscriptionDetails, tokenData: TokenData){
		try{
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query.clinicId = params.clinicId;
			query.createdBy = USER_TYPE.ADMIN;

			const projection = {subscriptionType:1, subscriptionDetails:1, subscriptionCharges:1, contract:1, isSubscribed:1, subscriptionStartDate:1, subscriptionEndDate:1, clinicId:1}
			return this.findOne(collection, query, {projection: projection});
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function mapSubscriptionListingData
	 * @description map the ClinicName in all subscription listing
	 * @returns list of subscriptions
	 */
	private async mapSubscriptionListingData(params:any){
		try{
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const clinicIds = params.map(item => item.clinicId);
			const clinicData = await this.find(providerColl, { clinicId: { $in: clinicIds }, createdBy: USER_TYPE.ADMIN }, { projection: { clinicName: 1, clinicId: 1 } });

			const clinicLookup: any = {};
			clinicData.forEach((clinic: any) => {
				clinicLookup[clinic.clinicId] = clinic.clinicName;
			});

			params.forEach((item: any) => {
				item.clinicName = clinicLookup[item.clinicId] || null;
			});
			return params;
		}
		catch(error){
			throw error;
		}
	}
}

export const subscriptionDao = new SubscriptionDao();
