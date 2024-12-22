"use strict";
import {
    dateToTimestamp,
    decryptData,
    encryptData,
    toObjectId,
} from "@utils/appUtils";
import {
    MESSAGES,
} from "@config/index";
import * as medicationConstant from "@modules/medication/v1/medicationConstant";
import { encryptedDb } from "@utils/DatabaseClient";
import { addMedication, editMedication } from "./routeValidation";
import { mediactionDaoV1 } from "..";
import moment from "moment";
import { mealDaoV1 } from "@modules/meal";
import { GLUCOSE_PRANDIAL } from "@modules/meal/v1/mealConstant";

export class MedicationController {

    /**
     * @function addMedication
     * @payload payload contains encrypted data : decrypted params defined below
     * @description patient can add medication's
     * @param params.mealCategory meal category (required)
     * @param params.type Medication type (required)
     * @param params.name medication name (required)
     * @param params.dosage medicin dosage (required)
     * @param params.time Medication taking time (required)
     * @returns 
     */
    async addMedication(payload: MedicationRequest.Payload, tokenData: TokenData) {
        try {
            const mealColl = encryptedDb.getMealEncryptedClient();
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MedicationRequest.addMedication = JSON.parse(decryptedData);
            const validation = addMedication.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isUserExists = await mediactionDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(medicationConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            params.userId = toObjectId(tokenData.userId);
            params.time = moment(params.date).valueOf();
            params.dateAsString = params.date.split("T")[0];
            params.medicationTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            const isMedicationExists = await mediactionDaoV1.isMedicationExists(params);
            if(isMedicationExists)return Promise.reject(medicationConstant.MESSAGES.ERROR.MEDICATION_ALREADY_ADDED);
            await mediactionDaoV1.addMedication(params);
            const date = params.date.split("T")[0];
            const data:any = {
                userId: toObjectId(tokenData.userId),
                date: params.date,
                category: params.category
            }
            const isMealExists = await mealDaoV1.isMealExists(data);
            if(!isMealExists){
                await mediactionDaoV1.findOneAndUpdate(mealColl, {userId: toObjectId(tokenData.userId), dateAsString: date, category: params.category}, {userId: toObjectId(tokenData.userId), category: params.category, date: params.date, isMedicationExists: true, medicationType: params.type, time: params.time, isGlucoseExists: false, isMealExists: false, dateAsString: params.dateAsString, medicationTime: params.medicationTime}, {upsert: true});
            }
            else{
                await mediactionDaoV1.findOneAndUpdate(mealColl, {userId: toObjectId(tokenData.userId), dateAsString: date, category: params.category}, {isMedicationExists: true, medicationType: params.type, dateAsString: params.dateAsString, medicationTime: params.medicationTime});
            }
            return medicationConstant.MESSAGES.SUCCESS.MEDICATION_ADDED;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * @function editMedication
     * @description patient can edit their medication's
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.medicationId medication's id (required)
     * @returns 
     */
    async editMedication(payload: MedicationRequest.Payload, tokenData: TokenData){
        try{
            const medicationColl = encryptedDb.getMedicationEncryptedClient();
            const mealColl = encryptedDb.getMealEncryptedClient();
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MedicationRequest.editMedication = JSON.parse(decryptedData);
            const validation = editMedication.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isMedicationExists = await mediactionDaoV1.findOne(medicationColl, {_id: toObjectId(params.medicationId), userId: toObjectId(tokenData.userId)});
            if(!isMedicationExists)return Promise.reject(medicationConstant.MESSAGES.ERROR.MEDICATION_NOT_FOUND);

            // Check the edit date of medication
            // if(timestampToDate(isMedicationExists.created) !== timestampToDate(Date.now()))
            //     return Promise.reject(medicationConstant.MESSAGES.ERROR.MEDICATION_NOT_EDITABLE);
            params.medicationTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            let result = await mediactionDaoV1.editMedication(params,tokenData.userId);
            const data:any = {
                userId: toObjectId(tokenData.userId),
                date: isMedicationExists.date,
                category: isMedicationExists.category
            }
            const isMealExists = await mealDaoV1.isMealExists(data);
            console.log('isMealExists',isMealExists)
            if(isMealExists){
                await mediactionDaoV1.findOneAndUpdate(mealColl, {userId: toObjectId(tokenData.userId), dateAsString: isMedicationExists.dateAsString, category: params.category}, {medicationTime: params.medicationTime});
            }
            result = encryptData(JSON.stringify(result));
            return medicationConstant.MESSAGES.SUCCESS.EDIT_MEDICATION(result);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getMedicationLogs
     * @description get the medicaiton of patient of the basis of date
     * @param params.date date (required)
     * @returns list of medications
     */
    async getMedicationLogs(params: MedicationRequest.getMedication, tokenData: TokenData){
        try{
            const isUserExists = await mediactionDaoV1.findUserById(tokenData.userId)
            if(!isUserExists) return Promise.reject(medicationConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            let data = await mediactionDaoV1.getMedicationLogs(params,tokenData);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
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
    async getPatientQuickSummary(params: MedicationRequest.QuickSummary, tokenData: TokenData){
        try{
            const isUser = await mediactionDaoV1.findUserById(params.patientId);
            if (!isUser) return Promise.reject(medicationConstant.MESSAGES.ERROR.USER_NOT_FOUND);
            let glucoseInterval;
            if (params.glucoseInterval) {
                glucoseInterval = params.glucoseInterval
            }
            else {
                glucoseInterval = isUser.glucoseInterval ? isUser.glucoseInterval : 1;
            }
            const userGlucoseInterval = isUser.glucoseInterval ? isUser.glucoseInterval : 1
            let data = await mediactionDaoV1.getPatientQuickSummary(params, tokenData, glucoseInterval, userGlucoseInterval);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }
}

export const medicationController = new MedicationController();
