"use strict";
import {
  decryptData,
  encryptData,
  toObjectId,
} from "@utils/appUtils";
import {
  MESSAGES,
  SERVER,
  STATUS,
  USER_TYPE,
} from "@config/index";
import * as patientConstant from "@modules/patient/v1/patientConstant";
import { editPatient, editRpmVisit, rpmVisit } from "./routeValidator";
import { axiosService } from "@lib/axiosService";
import { providerDaoV1 } from "@modules/provider";
import { patientDaoV1 } from "..";
import { encryptedDb } from "@utils/DatabaseClient";
import { NOTIFICATION_TYPE } from "@modules/provider/v1/providerConstant";

export class PatientController {
    
    /**
   * @function editPatientDetails
   * @description edit the details of patient from the provider
   * @payload payload contains encrypted data : decrypted params defined below
   * @param params.patientId patient id (required)
   * @returns object of upadted data
   */
    async editPatientDetails(payload: PatientRequest.Payload, accessToken: string, tokenData: TokenData){
        try{
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
            let params: PatientRequest.EditPatientDetails  = JSON.parse(decryptedData);
            const validation = editPatient.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
            }

            const isProvider = await providerDaoV1.findUserById(tokenData.userId)
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.status === STATUS.INACTIVE)
                return Promise.reject(MESSAGES.ERROR.BLOCKED);

            if(isProvider.createdBy !== USER_TYPE.ADMIN){
                if(isProvider.isMainProvider === false){
                    return Promise.reject(patientConstant.MESSAGES.ERROR.INVALID_PROVIDER);
                }
            }

            const data = await axiosService.patch({ "url": SERVER.PATIENT_APP_URL + SERVER.EDIT_PATIENT, "body":  payload, "auth": accessToken });
            return patientConstant.MESSAGES.SUCCESS.PATIENT_EDIT(data.data);
        }
        catch(error){
            throw error
        }
    }
 
    /**
     * @function getPatientGlucoseLogs
     * @description get the logs of glucose of a patient
     * @param params.patientId patient id (required)
     * @param params.fromDate from date (required)
     * @param params.toDate to date (required)
     * @returns list of glucose
     */
    async getPatientGlucoseLogs(params: PatientRequest.GlucoseLogs, accessToken: string, tokenData: TokenData){
        try{
            const isProvider = await providerDaoV1.findUserById(tokenData.userId)
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.status === STATUS.INACTIVE)
                return Promise.reject(MESSAGES.ERROR.BLOCKED);

            const data = await axiosService.getData({"url": SERVER.PATIENT_APP_URL + SERVER.GLUCOSE_LOGS, "payload": params, "auth": accessToken});
            return patientConstant.MESSAGES.SUCCESS.LIST(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function addRpmVisit
     * @description provider can add the rpm visit of an patient 
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.userId patient id(required)
     * @param params.date date (required)
     * @param params.visitTime time (required)
     * @returns 
     */
    async addRpmVisit(payload: PatientRequest.Payload, tokenData: TokenData, headers: any){
        try{
            const patientColl = encryptedDb.getPatientEncryptedClient();
            const providerColl = encryptedDb.getProviderEncryptedClient();
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
            let params: PatientRequest.RpmVisit  = JSON.parse(decryptedData);
            const validation = rpmVisit.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
            }

            const isProvider = await providerDaoV1.findUserById(tokenData.userId);
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.userType === USER_TYPE.NURSE || isProvider.userType === USER_TYPE.STAFF){
                if(!isProvider.isMainProvider){
                    return Promise.reject(patientConstant.MESSAGES.ERROR.INVALID_PROVIDER);
                }
            }

            const isPatient = await patientDaoV1.findOne(patientColl, {_id: toObjectId(params.userId), status: {$ne: STATUS.DELETED}});
            if(!isPatient)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            const provider = await providerDaoV1.findUserById(params.providerId);
            // const dueDate = moment(isPatient?.dueDate).startOf("day");
            // const newDate = dueDate.subtract(11, 'months').valueOf();
            // const endDate = moment(isPatient?.dueDate).startOf("day");
            // const newDate1 = endDate.add(30, 'days').valueOf();
            params.userId = toObjectId(params.userId);
            params.providerId = toObjectId(params.providerId);
            params.providerName = provider.adminName;
            params.clinicId = isProvider.clinicId;
            await patientDaoV1.addRpmVisit(params);
            if (isPatient.rpm < params.date) {
                await patientDaoV1.findOneAndUpdate(patientColl, { _id: toObjectId(params.userId) }, { rpm: params.date });
            }
            const providerIds = await providerDaoV1.distinct(providerColl, "_id", { _id: { $ne: toObjectId(tokenData.userId) }, clinicId: params.clinicId, userType: USER_TYPE.PROVIDER });
            let notificationData = {
                type: NOTIFICATION_TYPE.ADD_RPM,
                userId: providerIds,
                platform: headers.platform,
                details: {
                    name: isPatient.fullName,
                    providerName: isProvider.adminName
                }
            }
            notificationData = encryptData(JSON.stringify(notificationData));
            await this.inAppNotification(notificationData);
            return patientConstant.MESSAGES.SUCCESS.RPM_VISIT_ADDED;
        }
        catch(error){
            throw error;
        }
    }

    async inAppNotification(params){
        try{
          setTimeout(async() => {
            await axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": {data: params} });
          }, 500);
        }
        catch(error){
          throw error;
        }
      }

    /**
     * @function getMealDetails
     * @description fetch the details of meal by mealId
     * @param params.userId user id (required)
     * @param params.category meal category (required)
     * @param params.date meal date (required)
     * @returns object of meal details
     */
    async getMealAndMedication(params: PatientRequest.getMeal, accessToken: string, tokenData: TokenData){
        try{
            const isProvider = await providerDaoV1.findUserById(tokenData.userId)
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.status === STATUS.INACTIVE)
                return Promise.reject(MESSAGES.ERROR.BLOCKED);

            const data = await axiosService.getData({"url": SERVER.PATIENT_APP_URL + SERVER.MEAL_DETAILS, "payload": params, "auth": accessToken});
            return patientConstant.MESSAGES.SUCCESS.LIST(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getRpmVisitListing
     * @description get the listing of rpm visit of a patient
     * @param params.userId user Id (required)
     * @param params.fromDate from date (required)
     * @param params.toDate to date (required)
     * @returns list of rpm visit
     */
    async getRpmVisitListing(params: PatientRequest.GetRpmVisit, tokenData: TokenData){
        try{
            const patientColl = encryptedDb.getPatientEncryptedClient();
            const isProvider = await providerDaoV1.findUserById(tokenData.userId)
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.status === STATUS.INACTIVE)
                return Promise.reject(MESSAGES.ERROR.BLOCKED);

            const isPatient = await patientDaoV1.findOne(patientColl, {_id: toObjectId(params.userId), status: {$ne: STATUS.DELETED}});
            if(!isPatient)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            params.dueDate = isPatient?.dueDate;
            params.created = isPatient?.created;
            let data = await patientDaoV1.getRpmVisitListing(params);
            data = encryptData(JSON.stringify(data));
            return patientConstant.MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getPatientQuickSummary
     * @description  get the summary of meal and medication of an patient
     * @param params.patientId patient id (required)
     * @param params.fromDate from date (required)
     * @param params.toDate to date (required)
     * @returns list of patient meal medication average, 
     */
    async getPatientQuickSummary(params: PatientRequest.QuickSummary, tokenData: TokenData, accessToken: string){
        try{
            const isProvider = await providerDaoV1.findUserById(tokenData.userId)
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.status === STATUS.INACTIVE)
                return Promise.reject(MESSAGES.ERROR.BLOCKED);

            const data = await axiosService.getData({"url": SERVER.PATIENT_APP_URL + SERVER.QUICK_SUMMARY, "payload": params, "auth": accessToken});
            return patientConstant.MESSAGES.SUCCESS.LIST(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getPatientCgm
     * @description  get the summary of CGM of an patient
     * @param params.patientId patient id (required)
     * @param params.fromDate from date (required)
     * @param params.toDate to date (required)
     * @returns object patient cgm details, 
     */
    async getPatientCgm(params: PatientRequest.QuickSummary, tokenData: TokenData, accessToken: string){
        try{
            const isProvider = await providerDaoV1.findUserById(tokenData.userId)
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.status === STATUS.INACTIVE)
                return Promise.reject(MESSAGES.ERROR.BLOCKED);

            const data = await axiosService.getData({"url": SERVER.PATIENT_APP_URL + SERVER.CGM_PROFILE, "payload": params, "auth": accessToken});
            return patientConstant.MESSAGES.SUCCESS.LIST(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function editRpmVisit
     * @description edit the rpm visit of an patient
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.rpmId rpm id(required)
     * @returns 
     */
    async editRpmVisit(payload: PatientRequest.Payload, tokenData: TokenData){
        try{
            const patientColl = encryptedDb.getPatientEncryptedClient();
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
            let params: PatientRequest.editRpm = JSON.parse(decryptedData);
            const validation = editRpmVisit.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
            }

            const isProvider = await providerDaoV1.findUserById(tokenData.userId);
            if(!isProvider)return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);

            if(isProvider.userType === USER_TYPE.NURSE || isProvider.userType === USER_TYPE.STAFF){
                if(!isProvider.isMainProvider){
                    return Promise.reject(patientConstant.MESSAGES.ERROR.INVALID_PROVIDER);
                }
            }

            await patientDaoV1.editRpmVisit(params)
            return patientConstant.MESSAGES.SUCCESS.EDIT_RPM_VIST;
        }
        catch(error){
            throw error;
        }
    }
}

export const patientController = new PatientController();
