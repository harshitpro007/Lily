"use strict";

import { FIELD, STATUS, SUBSCRIPTION_TYPE, USER_TYPE } from "@config/main.constant";
import { logger } from "@lib/logger";
import { SERVER } from "@config/environment";
import { encryptedDb } from "@utils/DatabaseClient";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import {createObjectCsvWriter} from "csv-writer"
import { imageUtil } from "@lib/ImageUtil";
import axios from "axios";
import { VALID } from "./providerConstant";
import { providerControllerV1 } from "..";



export class ProviderDao extends EncryptionBaseDao {
	
	/**
	 * @function isEmailExists
	 * @description checks if email or userId exists or not
	 */
	async isEmailExists(params, userId?: string) {
		try {
			const query: any = {};
			query.email = new RegExp(`^${params.email}$`, 'i');
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			const projection = { hash: 0, salt: 0};
			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOne(collection,query, projection);
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

			return await this.findOne(collection,query);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	* @function createProvider
	* @description create the new provider
	*/
	async createProvider(params: ProviderRequest.Create) {
		try {
			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.insertOne(collection,params);
		} catch (error) {
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

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };
			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOne(collection, query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changePassword 
	 * @description update the hash (password) field in user's Document  
	 */
	async changePassword(params: ProviderRequest.ChangeForgotPassword) {
		try {
			const query: any = {};
			query.email = params.email;
			query.status = { "$ne": STATUS.DELETED };
			const update = {
				hash: params.hash
			};

			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.updateOne(collection,query,update);
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
			if(params.status === STATUS.INACTIVE){
				dataToUpdate["isMainProvider"] = false;
			}

			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOneAndUpdate(collection,query, dataToUpdate);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changeProfilePassword
	 * @description change the paswword of provider profile
	 */
	async changeProfilePassword(params: ProviderRequest.ChangePassword, userId:string){
		try {
			const query: any = {};
			if (userId) query._id = toObjectId(userId);
			if (params.email) query.email = params.email;

			const update = {
				"hash": params.hash,
				"isPasswordReset": true
			};

			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOneAndUpdate(collection,query, update);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changeClinicProfile
	 * @description edit the details of clinic
	 */
	async changeClinicProfile(payload: ProviderRequest.ChangeProfile, userId: string, clinicId: string){
		try {
			const subscriptionColl = encryptedDb.getsubscriptionEncryptedClient();
			const transactionColl = encryptedDb.getTransactionEncryptedClient();
			const query = {
				_id: toObjectId(userId),
			};
			let dataToSave: any = {};
			if(payload.clinicName){
				dataToSave["clinicName"] = payload.clinicName;
				await this.updateMany(subscriptionColl, {clinicId: clinicId}, {clinicName: payload.clinicName});
				await this.updateMany(transactionColl, {clinicId: clinicId}, {clinicName: payload.clinicName});
			}
			if(payload.profilePicture || payload.profilePicture === ""){
				dataToSave["profilePicture"] = payload.profilePicture
			}
			if(payload.mobileNo && payload.countryCode){
				dataToSave["mobileNo"] = payload.mobileNo
				dataToSave["countryCode"] = payload.countryCode
				dataToSave["fullMobileNo"] = payload.fullMobileNo
			}
			if(payload.zipCode && payload.street && payload.state && payload.city){
				dataToSave["zipCode"] = payload.zipCode;
				dataToSave["street"] = payload.street;
				dataToSave["state"] = payload.state;
				dataToSave["city"] = payload.city;
			}
			if(payload.currentPassword && payload.newPassword){
				dataToSave["hash"] = payload.hash
			}

			if(payload.adminName){
				dataToSave["adminName"] = payload.adminName;
			}

			if(payload.email) {
				dataToSave["email"] = payload.email;
			}
			if(payload.glucoseInterval){
				dataToSave["glucoseInterval"] = payload.glucoseInterval;
			}

			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOneAndUpdate(collection, query, dataToSave, {});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function getProfile
	 * @description get the user profile
	 */
	async getProfile(userId: string){
		try {
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query._id = toObjectId(userId)
			query.status = { "$ne": STATUS.DELETED };

			let projection = { updated: 0, salt: 0, hash: 0, refreshToken: 0 };
			let data = await this.findOne(collection, query, {projection:projection});
			if(data?.createdBy === USER_TYPE.PROVIDER){
				const result = await this.findOne(collection, {clinicId: data.clinicId, createdBy: USER_TYPE.ADMIN});
				data.clinicName = result.clinicName;
				data.organizationalNPI = result.organizationalNPI;
				data.subscriptionDetails = result.subscriptionDetails;
				data.subscriptionCharges = result.subscriptionCharges;
				data.subscriptionType = result.subscriptionType;
				data.contract = result.contract;
				data.isSubscribed = result.isSubscribed;
				data.glucoseInterval = result?.glucoseInterval;
			}
			return data;
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/** 
	 * @function getProviderListing
	 * @description Get the listing of providers
	 */
	async getProviderListing(params: ProviderRequest.ProviderListing, tokenData: TokenData){
		try{
			const aggPipe = [];
			const collection = encryptedDb.getProviderEncryptedClient();
			const match: any = {};
			if (params.searchKey) {//NOSONAR
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ clinicName: { "$regex": params.searchKey, "$options": "i" } },
				];
			}
			
			if(params.valid === VALID.PROVIDERS){//NOSONAR
				match.createdBy = USER_TYPE.ADMIN;
			}

			match.status = { "$in": [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING] };
			if(params.subscriptionType) match.subscriptionType = {"$in": params.subscriptionType[0].split(',')};//NOSONAR
			if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };//NOSONAR
			if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };//NOSONAR
			if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };//NOSONAR
			aggPipe.push({ "$match": match });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR
			aggPipe.push({ "$sort": sort });
			if(!params.isExport){//NOSONAR

				if (params.limit && params.pageNo) {//NOSONAR
					const [skipStage, limitStage] = this.addSkipLimit(
						params.limit,
						params.pageNo,
					);
					aggPipe.push(skipStage, limitStage);
				}
			}

			aggPipe.push({
				"$addFields": {
					userType: {
						$cond: {
							if: { $eq: ["$createdBy", USER_TYPE.ADMIN] },
							then: "CLINIC",
							else: "$userType"
						}
					}
				}
			});

			aggPipe.push({
				"$project": {
					_id: 1,  clinicName: 1, totalPaitents: 1, totalProviders: 1, created: 1, subscriptionType: 1, status: 1, resendDate:1, userType: 1, registeredType: 1, fullName: "$adminName"
				}
			});

			let pageCount = true;
			if(!params.isExport){//NOSONAR
				return await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo, pageCount);
			}else{
				const result = await this.aggregate(collection,aggPipe)
				const formattedData = result.map(item => ({
                    ...item,
                    created: new Date(item.created).toLocaleDateString(),
                }));
                console.log(formattedData);
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportToCSV(formattedData, `${tokenData.userId}_${date}__ProvidersList.csv`)),
				  };
				  
				return data;
			}
		}
		catch(error){//NOSONAR
			throw error;
		}
	}

	async exportToCSV(data: any[], fileName: string) {
		const csvWriter = createObjectCsvWriter({
			path: `${SERVER.UPLOAD_DIR}` + fileName,
			header: [
				{ id: 'clinicName', title: 'Clinic Name' },
				{ id: 'totalPaitents', title: 'Total Patients' },
				{ id: 'totalProviders', title: 'Total Providers' },
				{ id: 'created', title: 'Registered On' },
				{ id: 'subscriptionType', title: 'Subscription Type' },
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
	 * @function isNPIExists
	 * @description is NPI exist or not
	 */
	async isNPIExists(params, userId?: string){
		try{
			const collection = encryptedDb.getProviderEncryptedClient();
			const query: any = {};
			query.organizationalNPI = params.organizationalNPI;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			return await this.findOne(collection,query);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function resendInvite
	 * @description Resend invite to clinic
	 */
	async resendInvite(params: ProviderRequest.SentInvite){
		try{
			const collection = encryptedDb.getProviderEncryptedClient();
			const query = {
				_id: toObjectId(params.providerId),
				status: { $ne: STATUS.DELETED },
			};
			const update = {
				salt: params.salt,
				hash: params.hash,
				resendDate: params.resendDate
			}
			return await this.findOneAndUpdate(collection, query, update);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getProvidersListing
	 * @description get the listing of providers of a clinic
	 */
	async getProvidersListing(params:ProviderRequest.ProviderListing){
		try{
			const aggPipe = [];
			const collection = encryptedDb.getProviderEncryptedClient();
			const match: any = {};
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ adminName: { "$regex": params.searchKey, "$options": "i" } },
				];
			}

			match.clinicId = params.clinicId;

			if (params.status)
				match.status = { "$in": params.status };
			else
				match.status = { "$eq": STATUS.ACTIVE };
			
			if (params.userType) match.userType = { "$in": params.userType };
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
					_id: 1, adminName: 1, email: 1, fullMobileNo: 1, lastLogin: 1, userType: 1, status: 1, isMainProvider:1, countryCode: 1, mobileNo: 1, createdBy: 1, insensitive: { "$toLower": "$adminName" }
				}
			});
			if(params.sortBy==FIELD.ADMIN_NAME) {
				aggPipe.push({ "$sort": { "insensitive": params.sortOrder } });
			}

			return await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo, true);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getProviderDetails
	 * @description get the details of provider of a clinic
	 */
	async getProviderDetails(providerId: string){
		try{
			const collection = encryptedDb.getProviderEncryptedClient();
			const query = {
				_id: toObjectId(providerId),
				status: {$in: [STATUS.ACTIVE, STATUS.INACTIVE]}
			}
			const projection = {
				_id: 1, adminName: 1, email: 1, fullMobileNo:1, firstName: 1, lastName: 1, userType: 1, lastLogin: 1, status: 1, profilePicture: 1, countryCode:1, mobileNo:1, language:1, dob: 1, addedBy: 1, isMainProvider: 1, organizationalNPI: 1, createdBy: 1,
			}
			return await this.findOne(collection,query, {projection:projection});
		}	
		catch(error){
			throw error;
		}
	}

	/**
	 * @function changeProviderProfile
	 * @description update the profile of provider's of a clinic
	 */
	async changeProviderProfile(params: ProviderRequest.ChangeProfile){
		try{
			const query = {
				_id: toObjectId(params.providerId)
			};
			let dataToSave: any = {};
			if(params.firstName || params.lastName){
				dataToSave["firstName"] = params.firstName;
				dataToSave["lastName"] = params.lastName;
				dataToSave["adminName"] = params?.firstName + " " + params?.lastName;
			}
			if(params.profilePicture || params.profilePicture === ""){
				dataToSave["profilePicture"] = params.profilePicture
			}
			if(params.mobileNo && params.countryCode){
				dataToSave["mobileNo"] = params.mobileNo
				dataToSave["countryCode"] = params.countryCode
				dataToSave["fullMobileNo"] = params.fullMobileNo
			}
			if(params.userType){
				dataToSave["userType"] = params.userType;
			}

			if(params.isMainProvider === true || params.isMainProvider === false){
				dataToSave["isMainProvider"] = params.isMainProvider;
			}

			if(params.language){
				dataToSave["language"] = params.language;
			}

			if(params.dob){
				dataToSave["dob"] = params.dob;
			}

			if(params.organizationalNPI){
				dataToSave["organizationalNPI"] = params.organizationalNPI;
			}

			const collection = encryptedDb.getProviderEncryptedClient();
			return await this.findOneAndUpdate(collection, query, dataToSave, {});

		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getClinicData
	 * @description get the details of clinic by clinic name
	 */
	async getClinicData(params: ProviderRequest.Clinic, tokenData: TokenData){
		try{
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const query:any = {}
			if (params.clinicName) {
				params.clinicName = escapeSpecialCharacter(params.clinicName);
				query["$or"] = [
					{ clinicName: { "$regex": params.clinicName, "$options": "i" } },
				];
			}
			query.status = {$ne: STATUS.DELETED}
			const projection = {
				clinicName: 1,
				clinicId: 1
			}
			return await this.find(providerColl, query, {projection: projection});
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getProviderData
	 * @description get the details of provider by provider name
	 */
	async getProviderData(params: ProviderRequest.Provider, tokenData: TokenData){
		try{
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const query:any = {}
			if (params.providerName) {
				params.providerName = escapeSpecialCharacter(params.providerName);
				query["$or"] = [
					{ adminName: { "$regex": params.providerName, "$options": "i" } },
				];
			}
			query.status = {$ne: STATUS.DELETED};
			const projection = {
				adminName: 1,
			}
			return await this.find(providerColl, query, {projection: projection});
		}
		catch(error){
			throw error;
		}
	}

	/**
   	* @function getCityState
  	* @description get the state and city using zip code
	*/
	async getCityState(params: ProviderRequest.GetCity) {
		const url = SERVER.ZIPCODE_API_URL;
		const headersRequest = {
			'Content-Type': 'application/json',
			'apiKey': SERVER.ZIPCODE_API_KEY,
		};
		const response = await axios.get(url, {
			headers: headersRequest,
			params,
			paramsSerializer: function paramsSerializer(params) {
				return Object.entries(Object.assign({}, params)). // NOSONAR
				  map(([key, value]) => `${key}=${value}`).
				  join('&');
			  }
		});
		return response.data;
	}

	/**
   	* @function searchProviders
   	* @description search the provider of a clinic
   	*/
	async searchProviders(params: ProviderRequest.ProviderListing){
		try{
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const match: any = {};
			match.clinicId = params.clinicId;
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ adminName: { "$regex": params.searchKey, "$options": "i" } },
				];
			}

			const projection = {adminName: 1, clinicId: 1};
			const data = await this.find(providerColl, match, {projection: projection});
			return {data: data};
		}
		catch(error){
			throw error;
		}
	}

	/**
   * @function editProvider
   * @description edit the details of provider
   */
	async editProvider(params: ProviderRequest.EditProvider, providerDetails){
		try{
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const subscriptionModel = encryptedDb.getsubscriptionEncryptedClient();
			const query = {
				_id: toObjectId(params.userId)
			};
			let dataToSave: any = {};
			if(params.countryCode || params.mobileNo){
				dataToSave["countryCode"] = params.countryCode;
				dataToSave["mobileNo"] = params.mobileNo;
				dataToSave["fullMobileNo"] = params.fullMobileNo;
			}
			if(params.adminName){
				dataToSave["adminName"] = params.adminName
			}
			if(params.email){
				dataToSave["email"] = params.email;
				dataToSave["salt"] = params.salt;
				dataToSave["hash"] = params.hash;
			}
			if(params.zipCode && params.street && params.state && params.city){
				dataToSave["zipCode"] = params.zipCode;
				dataToSave["street"] = params.street;
				dataToSave["state"] = params.state;
				dataToSave["city"] = params.city;
			}

			if(params.contract){
				dataToSave["contract"] = params.contract;
				await this.findOneAndUpdate(providerColl, {clinicId: providerDetails.clinicId}, {contract:params.contract});
			}

			if(params.subscriptionType){
				dataToSave["subscriptionType"] = params.subscriptionType;
				if(providerDetails.subscriptionType === SUBSCRIPTION_TYPE.FREE){
					await this.findOneAndUpdate(providerColl, {clinicId: providerDetails.clinicId}, {isSubscribed: false, subscriptionType:params.subscriptionType});
					await this.findOneAndUpdate(subscriptionModel, {userId: toObjectId(params.userId)}, {status: STATUS.INACTIVE});
				}
				else if(params.subscriptionType === SUBSCRIPTION_TYPE.FREE){
					await this.findOneAndUpdate(providerColl, {clinicId: providerDetails.clinicId}, {isSubscribed: true, subscriptionType:params.subscriptionType});
					dataToSave["subscriptionStartDate"] = Date.now();
				}
			}

			if(params.subscriptionCharges){
				dataToSave["subscriptionCharges"] = params.subscriptionCharges;
				await this.findOneAndUpdate(providerColl, {clinicId: providerDetails.clinicId}, {subscriptionCharges: params.subscriptionCharges});
			}

			if(params.subscriptionDetails){
				dataToSave["subscriptionDetails"] = params.subscriptionDetails;
			}

			if(params.organizationalNPI){
				dataToSave["organizationalNPI"] = params.organizationalNPI;
			}

			if(params.glucoseInterval){
				dataToSave["glucoseInterval"] = params.glucoseInterval;
			}

			const result = await this.findOneAndUpdate(providerColl, query, dataToSave, {});
			if(params.subscriptionType && params.subscriptionType === SUBSCRIPTION_TYPE.FREE){
				const updatedClinicDetails = await this.findOne(providerColl, query);
				await providerControllerV1.addSubscription(updatedClinicDetails);
			}
			return result;
		}
		catch(error){
			throw error;
		}
	}
}

export const providerDao = new ProviderDao();