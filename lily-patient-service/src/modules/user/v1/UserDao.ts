"use strict";

import { STATUS, MESSAGES, USER_TYPE, FIELD } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import {createObjectCsvWriter} from "csv-writer"
import { escapeSpecialCharacter, getDeliveryStatus, isValidObjectId, processInChunks, toObjectId } from "@utils/appUtils";
import { SERVER } from "@config/environment";
import { imageUtil } from "@lib/ImageUtil";
import { DEVICE, DISPLAY_PATIENT_TYPES, PATIENT_GEST_STATUS, PATIENT_TYPE } from "./userConstant";
import moment from "moment";
import { userControllerV1 } from "..";
import { redisClient } from "@lib/index";
import { axiosService } from "@lib/axiosService";
import { mealDaoV1 } from "@modules/meal";
import { ObjectId } from "mongodb";




export class UserDao extends EncryptionBaseDao {

	/**
	 * @function isEmailExists
	 * @description checks if email or userId exists or not
	 */
	async isEmailExists(params, userId?: string) {
		try {
			const collection = encryptedDb.getUserEncryptedClient();
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
			const collection = encryptedDb.getUserEncryptedClient();
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
	 * @function isCodeExists
	 * @description checks if provider code exists or not
	 */
	async isCodeExist(params, userId?: string) {
		try {
			const collection = encryptedDb.getUserEncryptedClient();
			const query: any = {};
			query.providerCode = params.providerCode;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			return await this.findOne(collection, query);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	* @function createPatient
	* @description create the new provider
	*/
	async createPatient(params: UserRequest.CreatePatient) {
		try {
			const collection = encryptedDb.getUserEncryptedClient()
			return await this.insertOne(collection, params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updatePatient
	 * @description update the data of existing patient
	 */
	async updatePatient(params: UserRequest.CreatePatient, isEmail: boolean){
		try{
			const collection = encryptedDb.getUserEncryptedClient()
			const query: any = {};
			if(isEmail){
				query.email = params.email;
			}
			query.providerCode = {"$exists": false};
			query.providerId = {"$exists": false};

			return await this.findOneAndUpdate(collection, query, params)
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function signUp
	 * @description save new user's data in DB
	 */
	async signUp(params) {
		try {
			const collection = encryptedDb.getUserEncryptedClient()
			return await this.insertOne(collection, params);
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

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };
			const collection = encryptedDb.getUserEncryptedClient();
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
	async changePassword(params: UserRequest.ChangeForgotPassword) {
		try {
			const query: any = {};
			query.email = params.email;
			query.status = { "$ne": STATUS.DELETED };
			const update:any = {
				hash: params.hash
			};

			if(params.salt){
				update.salt = params.salt;
			}
			const collection = encryptedDb.getUserEncryptedClient();
			return await this.updateOne(collection, query, update);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}


	/**    
	* @function updateStatus
	* @description update the user status
	*/
	async updateStatus(params: UserRequest.updateStatus) {
		try {
			const query: any = {};
			const dataToUpdate: any = {}
			query['_id'] = toObjectId(params.userId);
			dataToUpdate['status'] = STATUS.INACTIVE;

			const collection = encryptedDb.getUserEncryptedClient();
			return await this.findOneAndUpdate(collection, query, dataToUpdate);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changeProfilePassword
	 * @description change in password of user's profile
	 */
	async changeProfilePassword(params: UserRequest.ChangePassword, userId) {
		try {
			const query: any = {};
			if (userId) query._id = userId
			if (params.email) query.email = params.email;

			const update = {};
			update["$set"] = {
				"hash": params.hash
			};

			return await this.updateOne("users", query, update, {});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function changeProfile
	 * @description edit the profile of user's
	 */
	async changeProfile(payload: UserRequest.ChangeProfile, userId) {
		try {
			const query = {
				_id: toObjectId(userId)
			};
			let dataToSave: any = {};
			if (payload.fullName) {
				dataToSave["fullName"] = payload.fullName;
				let nameParts = payload.fullName.trim().split(' ');
				let firstName = nameParts[0];
				let lastName = nameParts.slice(1).join(' ');
				dataToSave["firstName"] = firstName;
				dataToSave["lastName"] = lastName;
			}
			if (payload.profilePicture || payload.profilePicture === "") {
				dataToSave["profilePicture"] = payload.profilePicture
			}
			if (payload.countryCode && payload.mobileNo) {
				dataToSave["countryCode"] = payload.countryCode
				dataToSave["mobileNo"] = payload.mobileNo
				dataToSave["fullMobileNo"] = payload.fullMobileNo
				dataToSave["isMobileVerified"] = payload.isMobileVerified
			}
			if (payload.zipCode && payload.state && payload.city) {
				dataToSave["zipCode"] = payload.zipCode
				dataToSave["state"] = payload.state
				dataToSave["city"] = payload.city
			}
			if(payload.street){
				dataToSave["street"] = payload.street
			}
			if(payload.address){
				dataToSave["address"] = payload.address
			}
			if (payload.dob) {
				dataToSave["dob"] = payload.dob
			}
			if(payload.language){
				dataToSave["language"] = payload.language
			}
			if (payload.isDeviceConnected) {
				dataToSave["isDeviceConnected"] = payload.isDeviceConnected
			}
			if(payload.corffVariation){
				dataToSave["corffVariation"] = payload.corffVariation
			}
			if(payload.CgmActiveTime){
				dataToSave["CgmActiveTime"] = payload.CgmActiveTime
			}
			if(payload.glucoseDeviceToken){
				dataToSave["glucoseDeviceToken"] = payload.glucoseDeviceToken
			}
			if(payload.region){
				dataToSave["region"] = payload.region
				await redisClient.storeValue(`lily_device_region_${userId}`,payload.region);
			}
			if(payload.gmiPercent){
				dataToSave["gmiPercent"] = payload.gmiPercent
			}

			if(payload.device){
				if(payload.device === 1){
					dataToSave["device"] = DEVICE.DEXCOM_G7;
				}
				else if(payload.device === 2){
					dataToSave["device"] = DEVICE.LIBRA_3;
				}
				else if(payload.device === 3){
					dataToSave["device"] = DEVICE.ACCUCHEK;
				}
				else if(payload.device === 4){
					dataToSave["device"] = DEVICE.NA;
				}
			}

			if(payload.libraId){
				dataToSave["libraId"] = payload.libraId;
			}

			if(payload.glucoseInterval){
				dataToSave["glucoseInterval"] = payload.glucoseInterval
			}

			if(payload.dexcomUserName){
				dataToSave["dexcomUserName"] = payload.dexcomUserName
			}

			if(payload.dexcomPass){
				dataToSave["dexcomPass"] = payload.dexcomPass
			}

			const projection = {refreshToken:0, updated:0, hash: 0, salt: 0};
			const collection = encryptedDb.getUserEncryptedClient();
			return await this.findOneAndUpdate(collection, query, dataToSave, {projection: projection});
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function getPatientListing
	 * @description get the listing of patients
	 */
	async getPatientListing(params: UserRequest.PatientListing) {
		try {
			const aggPipe = [];
			const collection = encryptedDb.getUserEncryptedClient();
			const match: any = {};
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ fullName: { "$regex": params.searchKey, "$options": "i" } },
				];
			}

			match.clinicId = params.clinicId;
			if (params.status)//NOSONAR
				match.status = params.status;
			else
				match.status = { "$in": [STATUS.ACTIVE, STATUS.PENDING] };
			if(params.providerId){//NOSONAR
				const id = params.providerId[0].split(',');
				const providerIds = id.map(id => toObjectId(id));
				match.providerId = { "$in": providerIds };
			}
			if (params.management) match.management = { "$in": params.management[0].split(',') };//NOSONAR
			if (params.patientType) match.patientType = { "$in": params.patientType[0].split(',') };//NOSONAR
			if (params.rpmFromDate && !params.rpmToDate) match.rpm = { "$gte": params.rpmFromDate };//NOSONAR
			if (params.rpmToDate && !params.rpmFromDate) match.rpm = { "$lte": params.rpmToDate };//NOSONAR
			if (params.rpmFromDate && params.rpmToDate) match.created = { "$gte": params.rpmFromDate, "$lte": params.rpmToDate };//NOSONAR
			if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };//NOSONAR
			if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };//NOSONAR
			if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };//NOSONAR

			aggPipe.push({ "$match": match });

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
			
			aggPipe.push({
				"$project": {
					_id: 1, patientType: 1, device: 1, created: 1, management: 1, status: 1, rpm: 1, ppg: 1, fpg: 1, fullName: 1, lastLogin: 1, providerId: 1, dueDate: 1, isDeviceConnected:1, resendDate:1, dob:1, gest:1, insensitive: { "$toLower": "$fullName" }
				}
			});
			if(params.sortBy==FIELD.FULL_NAME) {
				aggPipe.push({ "$sort": { "insensitive": params.sortOrder } });
			}

			let pageCount = true;
			let data:any = await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo, pageCount);
			const activeUsers = await this.countDocuments(collection, { status: STATUS.ACTIVE, clinicId: params.clinicId });
			data.activeUsers = activeUsers;			
			return data;
		}
		catch (error) {//NOSONAR
			throw error;
		}
	}

	/**
	 * @function getProfile
	 * @description get the user's profile
	 */
	async getProfile(userId: string, offset?: number) {
		try {
			const query: any = {};
			query._id = toObjectId(userId)
			query.status = { "$ne": STATUS.DELETED };

			const projection = { updated: 0, salt: 0, hash: 0, refreshToken: 0, lastLogin:0};
			const collection = encryptedDb.getUserEncryptedClient();
			const user = await this.findOne(collection, query, { projection: projection });
			if(offset && offset>0){
				await this.findOneAndUpdate(collection, query, {offset: offset});
			}
			if (user) {
				if (user.fullMobileNo) {
					if (!user?.isMobileVerified) {
						user.isMobileVerified = false;
					}
				}
				if(user.patientType === PATIENT_TYPE.T1){
					user.displayPatientType = DISPLAY_PATIENT_TYPES.T1;
				}
				else if(user.patientType === PATIENT_TYPE.T2){
					user.displayPatientType = DISPLAY_PATIENT_TYPES.T2;
				}
				else if(user.patientType === PATIENT_TYPE.GDM){
					user.displayPatientType = DISPLAY_PATIENT_TYPES.GDM;
				}
				else{
					user.displayPatientType = DISPLAY_PATIENT_TYPES.NA;
				}
			}
			if(!user?.gest || user?.gest !== PATIENT_GEST_STATUS.DELIVERED){
				user.gest = getDeliveryStatus(user.dueDate);
			}
			return user;
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function deleteAccount
	 * @description Used to delete the account
	 */
	async deleteAccount(userId: string){
		try{
			const collection = encryptedDb.getUserEncryptedClient();
			const query: any = {};
			const dataToUpdate: any = {}
			query._id = toObjectId(userId);
			dataToUpdate.status = STATUS.DELETED;
			return await this.findOneAndUpdate(collection,query,dataToUpdate);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function resendInvite
	 * @description Resend invite to patient
	 */
	async resendInvite(params: UserRequest.SentInvite){
		try{
			const collection = encryptedDb.getUserEncryptedClient();
			const query = {
				_id: toObjectId(params.patientId),
				status: { $ne: STATUS.DELETED },
			};
			const update = {
				providerCode: params.providerCode,
				resendDate: params.resendDate
			}
			return await this.findOneAndUpdate(collection, query, update);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getAllPatients
	 * @description get the listing of all patients active/inactive
	 */
	async getAllPatients(params: UserRequest.PatientListing, tokenData:TokenData){
		try{
			const collection = encryptedDb.getUserEncryptedClient();
			const aggPipe: any = [];
			const match: any = {};
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ fullName: { "$regex": params.searchKey, "$options": "i" } },
				];

				if (isValidObjectId(params.searchKey)) {
					match["$or"].push({ _id: toObjectId(params.searchKey) });
				}
			}
			if (params.status)
				match.status = { "$in": params.status[0].split(',') };
			else
				match.status = { "$in": [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING] };

			if(params.providerId){
				const providerIds = params.providerId[0].split(',');
				match.providerId = { $in: providerIds.map(id => toObjectId(id)) };
			}
			if(params.clinicId){
				const clinicIds = params.clinicId[0].split(',');
				match.clinicId = { $in: clinicIds };
			}
			if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };
			if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };
			if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };
			if (params.platforms){
				match.platform = params.platforms;
			}
			aggPipe.push({ "$match": match });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR
			aggPipe.push({ "$sort": sort });

			if(!params.isExport){
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
					_id: 1, created: 1, status: 1, fullName: 1, providerId: 1, clinicId: 1, dueDate: 1, userType: 1, gest:1
				}
			});

			let pageCount = true;
			if(!params.isExport){
				let data:any = await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo, pageCount);
				if(params.status === STATUS.INACTIVE){
					data.inactivePatient = await this.countDocuments(collection, {status: STATUS.INACTIVE});
				}
				else{
					data.activePatient = await this.countDocuments(collection, {status: {$in: [STATUS.ACTIVE, STATUS.PENDING]}});
				}
				data.data = await this.mapPatientListingData(data.data);
				return data;
			}else{
				const patients = await this.aggregate(collection,aggPipe)
				const result = await this.mapPatientListingData(patients);
				const formattedData = result.map(item => ({
                    ...item,
                    created: new Date(item.created).toLocaleDateString(),
					gestWeek: getDeliveryStatus(item.dueDate)
                }));
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportToCSV(formattedData, `${tokenData.userId}_${date}__PatientList.csv`)),
				};
				  
				return MESSAGES.SUCCESS.DETAILS(data);
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
				{ id: '_id', title: 'Patient Id' },
				{ id: 'clinicName', title: 'Clinic Name' },
				{ id: 'providerName', title: 'Provider Name' },
				{ id: 'created', title: 'Registered On' },
				{ id: 'gestWeek', title: 'Gest Week' },
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
	 * @function mapPatientListingData
	 * @description map the providerName and ClinicName in all patient listing
	 * @returns list of patients
	 */
	private async mapPatientListingData(params:any){
		try{
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const providerIds = params.map(item => item.providerId);
			const clinicIds = params.map(item => item.clinicId);
			const providerData = await this.find(providerColl, { _id: { $in: providerIds } }, { projection: { adminName: 1 } });
			const clinicData = await this.find(providerColl, { clinicId: { $in: clinicIds }, createdBy: USER_TYPE.ADMIN }, { projection: { clinicName: 1, clinicId: 1 } });
			const providerLookup: any = {};
			providerData.forEach((provider: any) => {
				providerLookup[provider._id] = provider.adminName;
			});

			params.forEach((item: any) => {
				item.providerName = providerLookup[item.providerId] || null;
			});

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
	 * @function resetPatientPassword
	 * @description update the user's password by admin
	 */
	async resetPatientPassword(params: UserRequest.ResetPassword){
		try{
			const patientColl = encryptedDb.getUserEncryptedClient();
			const query = {
				_id: toObjectId(params.userId),
				status: {$ne : STATUS.DELETED}
			}

			const update = {
				salt: params.salt,
				hash: params.hash
			}

			return await this.findOneAndUpdate(patientColl, query, update)
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function editPatientDetails
	 * @description edit the details of patient from the provider 
	 */
	async editPatientDetails(params: UserRequest.EditPatientDetails, userData){
		try{
			const query = {
				_id: toObjectId(params.patientId)
			};
			let dataToSave: any = {};
			if (params.firstName && params.lastName) {//NOSONAR
				dataToSave["firstName"] = params.firstName;
				dataToSave["lastName"] = params.lastName;
				dataToSave["fullName"] = params.firstName + " " + params.lastName;
			}
			if (params.countryCode && params.mobileNo) {//NOSONAR
				dataToSave["countryCode"] = params.countryCode
				dataToSave["mobileNo"] = params.mobileNo
				dataToSave["fullMobileNo"] = params.fullMobileNo
				dataToSave["isMobileVerified"] = false
			}
			if (params.street && params.zipCode && params.city && params.state) {//NOSONAR
				dataToSave["street"] = params.street;
				dataToSave["zipCode"] = params.zipCode;
				dataToSave["city"] = params.city;
				dataToSave["state"] = params.state;
			}
			if (params.dob) {//NOSONAR
				dataToSave["dob"] = params.dob
			}
			if(params.language){//NOSONAR
				dataToSave["language"] = params.language
			}
			if (params.dueDate && userData.status === STATUS.INACTIVE) {//NOSONAR
				dataToSave["dueDate"] = params.dueDate;
				dataToSave["status"] = STATUS.ACTIVE;
				dataToSave["isDelivered"] = false;
				delete dataToSave["deliveredDate"];
			}
			if(params.medication){//NOSONAR
				dataToSave["medication"] = params.medication
				dataToSave["medicationDate"] = Date.now();
			}
			if(params.patientType){//NOSONAR
				dataToSave["patientType"] = params.patientType
			}
			if(params.device){//NOSONAR
				dataToSave["device"] = params.device
			}
			if(params.management){//NOSONAR
				dataToSave["management"] = params.management
			}
			if(params.providerId){//NOSONAR
				dataToSave["providerId"] = toObjectId(params.providerId);
			}
			if(params.isDelivered && params.deliveredDate && (userData.status === STATUS.ACTIVE || userData.status === STATUS.PENDING)){//NOSONAR
				dataToSave["isDelivered"] = params.isDelivered;
				dataToSave["deliveredDate"] = params.deliveredDate;
				dataToSave["gest"] = PATIENT_GEST_STATUS.DELIVERED;
			}
			if(params.email){//NOSONAR
				dataToSave["email"] = params.email;
			}
			if(params.glucoseInterval){
				dataToSave["glucoseInterval"] = params.glucoseInterval;
			}

			const projection = {refreshToken:0, updated:0, hash: 0, salt: 0};
			const collection = encryptedDb.getUserEncryptedClient();
			return await this.updateOne(collection, query, dataToSave, {projection: projection});

		}
		catch(error){
			throw error;
		}
	}

	/**
   	* @function checkDeliveredDate
   	* @description update the status of user on the basis of delivered date
   	*/
	async checkDeliveredDate() {
		try {
			console.log('**********************************checkDeliveredDate********************************')
			const userColl = encryptedDb.getUserEncryptedClient();
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const query = {
				status: STATUS.ACTIVE,
				isDelivered: true,
				deliveredDate: { "$exists": true },
			};
			const currentDate = moment();
			const users = await this.find(userColl, query);
			for (const user of users) {
				console.log("$$$$$$$$$$", user);
				const deliveredDate = moment(user.deliveredDate);
				if (currentDate.diff(deliveredDate, 'days') >= 30) {
					await this.findOneAndUpdate(userColl, { _id: user._id }, { status: STATUS.INACTIVE });
					const clinicData = await this.findOne(providerColl, { clinicId: user.clinicId, createdBy: USER_TYPE.ADMIN });
					const count = clinicData.totalPaitents - 1;
					await this.updateOne(
						providerColl,
						{ clinicId: user.clinicId, createdBy: USER_TYPE.ADMIN },
						{ totalPaitents: count }
					);
					await userControllerV1.removeSession(user, true);
				}
			}
			return true;
		}
		catch (error) {
			console.log("Error in check delivered date: ", error);
			throw error;
		}
	}

	async updateLibreGraphLastTimeInterval(){
		try{
			const userColl = encryptedDb.getUserEncryptedClient();
			return await userColl.updateMany({}, { $unset: { libreGraphLastTimeInterval: 1 } });
		}
		catch(error){
			throw error;
		}
	}

	async getPatientLibreDeviceData(){
		try{
			const userModel = encryptedDb.getUserEncryptedClient();
			const userDetails = await this.find(userModel, {status: STATUS.ACTIVE, glucoseDeviceToken: {$exists: true}, libraId: {$exists: true}, device: DEVICE.LIBRA_3}, {projection: {_id:1, libraId: 1, glucoseDeviceToken:1}});
			console.log('%%%%%%%%%%', userDetails);
			if(userDetails.length){
				console.log("11111111111");
				await processInChunks(userDetails, SERVER.CHUNK_SIZE, async (chunk) => {
					await this.updateDeviceData(chunk);
				});
			}
		}
		catch(error){
			throw error;
		}
	}
	
	// Function to call Libra API and update the data
	async updateDeviceData(usersChunk) {
		for (const user of usersChunk) {
			try {
				const deviceData = await axiosService.getLibra({"url":`https://api-us.libreview.io/llu/connections/${user?.libraId}/graph`, "auth": user?.glucoseDeviceToken });
				const data = deviceData.data.graphData;
				console.log(user._id,"User current date device data",data, );
				if(deviceData.data.graphData.length){
					const transformedData = data.map(item => {
						return {
						  time: item.Timestamp,
						  value: item.Value,
						  timeInMsec: moment(item.Timestamp, 'MM/DD/YYYY h:mm:ss A').valueOf()
						};
					  });
					const patientData = {
						date: moment(transformedData[0].time, 'MM/DD/YYYY h:mm:ss A').format('MM-DD-YYYY'),
						glucose: transformedData,
						deviceType: DEVICE.LIBRA_3
					}
					await mealDaoV1.addDeviceHistory(patientData, {userId: user._id});
				}
			} catch (error) {
				console.error(`Failed to fetch or update data for user ${user._id}`, error);
			}
		}
	};

	async getPatientDexcomDeviceData(){
		try{
			const userModel = encryptedDb.getUserEncryptedClient();
			const userDetails = await this.find(userModel, {status: STATUS.ACTIVE, dexcomUserName: {$exists: true}, dexcomPass: {$exists: true}, device: DEVICE.DEXCOM_G7}, {projection: {_id:1, dexcomPass: 1, dexcomUserName:1}});
			if(userDetails.length){
				await processInChunks(userDetails, SERVER.CHUNK_SIZE, async (chunk) => {
					await this.updateDexcomDeviceData(chunk);
				});
			}
		}
		catch(error){
			throw error;
		}
	}
	
	// Function to call Libra API and update the data
	async updateDexcomDeviceData(usersChunk) {
		for (const user of usersChunk) {
			try {
				const payload = {
					username: user.dexcomUserName,
					password: user.dexcomPass
				}
				const deviceData = await axiosService.get({"url":`https://preprod-dexcom.lilylink.com/glucose/historical`, "payload": payload });
				const data = deviceData.data.readings;
				console.log("User current date device data",data);
				if(data){
					const patientData = {
						date: moment(data[0].timestamp, 'YYYY-MM-DD h:mm:ss A').format('MM-DD-YYYY'),
						glucose: data,
						deviceType: DEVICE.DEXCOM_G7
					}
					await mealDaoV1.addDeviceHistory(patientData, {userId: user._id});
				}
			} catch (error) {
				console.error(`Failed to fetch or update data for user ${user._id}`, error);
			}
		}
	};
}

export const userDao = new UserDao();