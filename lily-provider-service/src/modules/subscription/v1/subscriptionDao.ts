import { STATUS, USER_TYPE } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { toObjectId } from "@utils/appUtils";
import { SUBSCRIPTION_STATUS } from "./subscriptionConstant";
import { createObjectCsvWriter } from "csv-writer";
import { SERVER } from "@config/index";
import { imageUtil } from "@lib/ImageUtil";
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
	 * @function getSubscriptionListing
	 * @description get the listing of clinic subscriptions
	 */
	async getSubscriptionListing(params: SubscriptionRequest.SubscriptionListing, tokenData: TokenData){
		try{
			const collection = encryptedDb.getsubscriptionEncryptedClient();
			const aggPipe = []; //NOSONAR
			const match: any = {};

			match.status = { "$in": [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.INACTIVE, SUBSCRIPTION_STATUS.PENDING, SUBSCRIPTION_STATUS.FAILED]};
			aggPipe.push({ "$match": match });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR
			aggPipe.push({ "$sort": sort });

			if (!params.isExport) {
				if (params.limit && params.pageNo) {
					const [skipStage, limitStage] = this.addSkipLimit(
						params.limit,
						params.pageNo,
					);
					aggPipe.push(skipStage, limitStage);
				}
			}

			aggPipe.push({
				"$project": {
					_id: 1, clinicId: 1, created: 1, subscriptionType: 1, amount: 1, status: 1
				}
			});

			let pageCount = true;
			if(!params.isExport){
				let data = await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo, pageCount);
				data.data = await this.mapSubscriptionListingData(data.data);
				return data;
			}else{
				const subscription = await this.aggregate(collection,aggPipe)
				const result = await this.mapSubscriptionListingData(subscription);
				const formattedData = result.map(item => ({
                    ...item,
                    created: new Date(item.created).toLocaleDateString(),
					amount: `$${item.amount}`
                }));
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportToCSV(formattedData, `${tokenData.userId}_${date}__SubscriptionListing.csv`)),
				};
				return data
			}
			
		}
		catch(error){
			throw error;
		}
	}

	async exportToCSV(data: any[], fileName: string) {
		const csvWriter = createObjectCsvWriter({
			path: `${SERVER.UPLOAD_DIR}` + fileName,
			header: [
				{ id: 'clinicName', title: 'Clinic Name' },
				{ id: 'created', title: 'Registered On' },
				{ id: 'subscriptionType', title: 'Subscription Type' },
				{ id: 'amount', title: 'Price' },
				{ id: 'status', title: 'Status' }
			],
		});

		try {
			await csvWriter.writeRecords(data);
			return await imageUtil.uploadSingleMediaToS3(fileName);
		} catch (error) {
			console.error('Error writing CSV:', error);
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

	/**
	 * @function editSubscriptionDetails
	 * @description edit the details of subscription of a clinic
	 */
	async editSubscriptionDetails(params: SubscriptionRequest.EditSubscriptionDetails){
		try{
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query.clinicId = params.clinicId;
			query.createdBy = USER_TYPE.ADMIN;

			const update = {
				subscriptionDetails: params.subscriptionDetails
			}

			const projection = {subscriptionType:1, subscriptionDetails:1, subscriptionCharges:1, contract:1, isSubscribed:1, subscriptionStartDate:1, subscriptionEndDate:1, clinicId:1};
			return await this.updateOne(collection, query, update, {projection: projection});
		}
		catch(error){
			throw error
		}
	}

	/**
	 * @function finTransactionById
	 * @description find transaction with id
	 */
	async findTransactionById(params: SubscriptionRequest.transactionId){
		try{
			const collection = encryptedDb.getTransactionEncryptedClient();
			return await this.findOne(collection,params);
		}
		catch(error){
			throw error;
		}
	}
}

export const subscriptionDao = new SubscriptionDao();
