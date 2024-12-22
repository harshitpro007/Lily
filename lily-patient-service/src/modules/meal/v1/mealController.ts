"use strict";
import {
    decryptData,
    encryptData,
    toObjectId,
} from "@utils/appUtils";
import {
    DAYS_CONST,
    MESSAGES,
    timeZones,
    USER_TYPE,
} from "@config/index";
import { addDeviceHistory, addGlucose, addMeal, editGlucose, editMeal } from "./routeValidator";
import * as mealConstant from "@modules/meal/v1/mealConstant";
import { mealDaoV1 } from "..";
import moment_timzone from "moment-timezone";
import moment from "moment";
import { encryptedDb } from "@utils/DatabaseClient";
import { GLUCOSE_PRANDIAL } from "@modules/meal/v1/mealConstant";
import { DEVICE } from "@modules/user/v1/userConstant";

export class MealController {

    /**
     * @function addMeal
     * @payload payload contains encrypted data : decrypted params defined below
     * @description patient can add meal
     * @param params.category meal category (required)
     * @param params.image meal image (required)
     * @param params.description meal description (required)
     * @param params.time meal time (required)
     * @param params.carbs meal carbs (required)
     * @returns 
     */
    async addMeal(payload: MealRequest.Payload, tokenData: TokenData) {
        try {
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MealRequest.addMeal = JSON.parse(decryptedData);
            const validation = addMeal.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isUserExists = await mealDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            params.userId = toObjectId(tokenData.userId);
            params.time = moment(params.date).valueOf();
            params.dateAsString = params.date.split("T")[0];
            params.unit = mealConstant.UNIT.GLUCOSE_UNIT;
            const isMealExists = await mealDaoV1.isMealExists(params);
            if(isMealExists && isMealExists?.isMealExists)return Promise.reject(mealConstant.MESSAGES.ERROR.MEAL_ALREADY_ADDED);    
            if(!isMealExists?.isGlucoseExists || params?.glucose  === 0){
                params.isGlucoseExists = false;
            }
            if(!isMealExists?.isGlucoseExist2hr || params?.glucose_2hr  === 0){
                params.isGlucoseExist2hr = false;
            }

            let glucoseValue;
            if(params.glucose && isUserExists.device == DEVICE.NA && isUserExists.glucoseInterval && isUserExists.glucoseInterval == GLUCOSE_PRANDIAL.TWO){
                params.glucose_2hr = params?.glucose;
                params.isGlucoseExist2hr = true;
                glucoseValue = params?.glucose;
                delete params?.glucose;
            }else if(params?.glucose > 0){
                params.isGlucoseExists = true;
            }

            if(params.category === mealConstant.MEAL_CATEGORY.FASTING){
                params.glucose_2hr = glucoseValue || params?.glucose;
                params.isGlucoseExist2hr = true;
            }

            if(!isMealExists?.isMedicationExists){
                params.isMedicationExists = false;
            }
            
            if(params.image || params.description){
                params.isDescOrImageExists = true
            }
            else{
                params.isDescOrImageExists = false
            }
            params.isMealExists = true;
            params.created = Date.now();
            const meal= await mealDaoV1.addMeal(params);
            if(params.category === mealConstant.MEAL_CATEGORY.FASTING){
                await this.updateFPG(tokenData);
            }
            else{
                await this.updatePPG(tokenData);
            }
            return mealConstant.MESSAGES.SUCCESS.MEAL_ADDED;
        }
        catch (error) {
            throw error;
        }
    }

    async updateFPG(tokenData){
        try{
            const mealColl = encryptedDb.getMealEncryptedClient();
            const userColl = encryptedDb.getUserEncryptedClient();
            const startDate = moment().subtract(7, 'days').startOf('day').valueOf();
            const endDate = moment().endOf('day').valueOf();

            const glucoseRecords = await mealDaoV1.find(mealColl,{
                userId: toObjectId(tokenData.userId),
                category: mealConstant.MEAL_CATEGORY.FASTING,
                glucose: {$gt: 0},
                time: { $gte: startDate, $lte: endDate }
            });

            if (glucoseRecords && glucoseRecords.length > 0) {
                const totalGlucose = glucoseRecords.reduce((sum, record) => sum + record.glucose, 0);
                const averageGlucose = totalGlucose ? Math.round(totalGlucose / glucoseRecords.length) : 0;
                await mealDaoV1.findOneAndUpdate(userColl, {_id: toObjectId(tokenData.userId)}, {fpg: averageGlucose})
            }
            return;
        }
        catch(error){
            throw error;
        }
    }

    async updatePPG(tokenData){
        try{
            const mealColl = encryptedDb.getMealEncryptedClient();
            const userColl = encryptedDb.getUserEncryptedClient();
            const startDate = moment().subtract(7, 'days').startOf('day').valueOf();
            const endDate = moment().endOf('day').valueOf();

            const glucoseRecords = await mealDaoV1.find(mealColl,{
                userId: toObjectId(tokenData.userId),
                glucose: {$gt: 0},
                category: {$in : [mealConstant.MEAL_CATEGORY.BREAKFAST, mealConstant.MEAL_CATEGORY.LUNCH, mealConstant.MEAL_CATEGORY.DINNER]},
                time: { $gte: startDate, $lte: endDate }
            });

            if (glucoseRecords && glucoseRecords.length > 0) {
                const totalGlucose = glucoseRecords.reduce((sum, record) => sum + record?.glucose, 0);
                const averageGlucose = totalGlucose ? Math.round(totalGlucose / glucoseRecords.length) : 0;
                await mealDaoV1.findOneAndUpdate(userColl, {_id: toObjectId(tokenData.userId)}, {ppg: averageGlucose})
            }
            return;
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function editMeal
     * @description patient can edit their meal's
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.mealId meal's id (required)
     * @returns 
     */
    async editMeal(payload: MealRequest.Payload, tokenData: TokenData){
        try{
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MealRequest.editMeal = JSON.parse(decryptedData);
            const validation = editMeal.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isUserExists = await mealDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            const isMealExists = await mealDaoV1.findMealById(params, tokenData);
            if(!isMealExists)return Promise.reject(mealConstant.MESSAGES.ERROR.MEAL_NOT_FOUND);

            // Check the edit date of meal
            // if(timestampToDate(isMealExists.created) !== timestampToDate(Date.now()))
            //     return Promise.reject(mealConstant.MESSAGES.ERROR.MEAL_NOT_EDITABLE)

            if(params.image !== "" || params.description !== ""){
                params.isDescOrImageExists = true
            }
            else{
                params.isDescOrImageExists = false;
            }

            if(params?.glucose && params?.glucose == 0){
                params.isGlucoseExists = false;
            }

            if(params?.glucose_2hr && params?.glucose_2hr == 0){
                params.isGlucoseExist2hr = false;
            }

            if(isMealExists.category === mealConstant.MEAL_CATEGORY.FASTING && params.glucose){
                params.glucose_2hr = params?.glucose;
            }
            
            if(params.glucose && isUserExists.device == DEVICE.NA && isUserExists.glucoseInterval && isUserExists.glucoseInterval == GLUCOSE_PRANDIAL.TWO){
                params.glucose_2hr = params?.glucose;
                params.isGlucoseExist2hr = true;
                delete params?.glucose;
            }else if(params?.glucose && params?.glucose > 0){
                params.isGlucoseExists = true;
            }
            let result = await mealDaoV1.editMeal(params,tokenData.userId);
            result = encryptData(JSON.stringify(result));
            return mealConstant.MESSAGES.SUCCESS.EDIT_MEAL(result);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function addGlucose
     * @payload payload contains encrypted data : decrypted params defined below
     * @description add glucose for a meal
     * @param params.category meal category (required)
     * @param params.time meal time (required)
     * @param params.glucose glucose (required)
     * @returns 
     */
    async addGlucose(payload: MealRequest.Payload, tokenData: TokenData){
        try{
            const userColl = encryptedDb.getUserEncryptedClient();
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MealRequest.addGlucose = JSON.parse(decryptedData);
            const validation = addGlucose.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isUserExists = await mealDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            const userId = toObjectId(tokenData.userId); // Replace with the actual userId
            const glucoseUnit = mealConstant.UNIT.GLUCOSE_UNIT; // Replace with the actual glucose unit

            const data = params.data.map(item => {
                let isGlucoseExists = false;
				let isGlucoseExist2hr = false;
                if(item?.glucose && item?.glucose > 0){
					isGlucoseExists = true;
				}
				if(item?.glucose_2hr && item?.glucose_2hr > 0){
					isGlucoseExist2hr = true;
				}
                const time = moment(item.date).valueOf();
                const dateAsString = item.date.split("T")[0];
                return {...item,userId,glucoseUnit,isGlucoseExists, isGlucoseExist2hr, time, dateAsString};
            });

            await mealDaoV1.addGlucose(data);
            await mealDaoV1.findOneAndUpdate(userColl, { _id: toObjectId(tokenData.userId) }, { isGlucoseAdded: true });
            await Promise.all([
                this.updateFPG(tokenData),
                this.updatePPG(tokenData)
            ]);
            return mealConstant.MESSAGES.SUCCESS.GLUCOSE_ADDED;
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getMealDetails
     * @description fetch the details of meal by mealId
     * @param params.category meal category (required)
     * @param params.date meal date (required)
     * @returns object of meal details
     */
    async getMealMedication(params: MealRequest.getMeal, tokenData: TokenData){
        try{
            params.userId = params?.userId || tokenData.userId;
            const isUserExists = await mealDaoV1.findUserById(params.userId);
            if(!isUserExists)return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            let data = await mealDaoV1.getMealMedication(params, isUserExists, tokenData.userType);

            data = encryptData(JSON.stringify(data));
            return mealConstant.MESSAGES.SUCCESS.MEAL_DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getGlucoseLogs
     * @description get the list of glucose logs for home
     * @param params.pageNo page no (required)
     * @param params.limit limit (required)
     * @param params.date date is required
     * @returns list of glucose logs
     */
    async getGlucoLive(params: MealRequest.getMeal, tokenData:TokenData,headers:any){
        try{
            const timezone= headers.timezone?headers.timezone:timeZones[1];
            const offset= headers.offset?headers.offset:0;
            console.log('*************timezonetimezone**************',timezone);
            console.log('*************offset*********',offset);
            const isUserExists = await mealDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            let data = await mealDaoV1.getGlucoLive(params,tokenData,timezone,offset,isUserExists);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getMealLogs
     * @description get the meals of patient of the basis of date
     * @param params.date date (required)
     * @returns list of meals
     */
    async getMealLogs(params: MealRequest.getMeal, tokenData: TokenData){
        try{    
            const isUserExists = await mealDaoV1.findUserById(tokenData.userId)
            if(!isUserExists) return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            let data = await mealDaoV1.getMealLogs(params,tokenData,isUserExists);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
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
    async getGlucoseLogs(params: MealRequest.GlucoseLogs, tokenData: TokenData){
        try{
            const isUser = await mealDaoV1.findUserById(params.patientId);
            if (!isUser) return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);
            let glucoseInterval;
            if(params.glucoseInterval){
                 glucoseInterval = params.glucoseInterval
            }
            else {
                glucoseInterval = isUser.glucoseInterval ? isUser.glucoseInterval : 1;
            }
            if(params.type === mealConstant.LOGS_DAYS.ALL_TIME && params.isExport){
                mealDaoV1.getGlucoseLogs(params, tokenData, glucoseInterval);
                return mealConstant.MESSAGES.SUCCESS.GLUCOSE_LOGS;
            }
            const userGlucoseInterval = isUser.glucoseInterval ? isUser.glucoseInterval : 1
            let data = await mealDaoV1.getGlucoseLogs(params, tokenData, glucoseInterval, userGlucoseInterval);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getPatientCgmDetails
     * @description  get the summary of CGM of an patient
     * @param params.patientId patient id (required)
     * @param params.fromDate from date (required)
     * @param params.toDate to date (required)
     * @returns object patient cgm details, 
     */
    async getPatientCgmDetails(params: MedicationRequest.QuickSummary, tokenData: TokenData){
        try{
            const isUser = await mealDaoV1.findUserById(params.patientId);
            if (!isUser) return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            let data = await mealDaoV1.getPatientCgmDetails(params, tokenData);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getGlucoseAverages
     * @description get the averages of glucose on the basis of days
     * @param params.type type (required)
     * @param params.days days (required)
     * @returns object of glucose average
     */
    async getGlucoseAverages(params: MealRequest.Averaves, tokenData: TokenData, headers){
        try{
            const isUser = await mealDaoV1.findUserById(tokenData.userId);
            if (!isUser) return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);
            const glucoseInterval = isUser.glucoseInterval ? isUser.glucoseInterval : 1;
            let timeZone:any;
            switch(params.days){
                case mealConstant.DAYS.THREE_DAYS:
                    params.fromDate = moment_timzone().tz(headers.timezone).subtract(DAYS_CONST.THREE, 'days').startOf('day').valueOf();
                    timeZone = moment_timzone().tz(headers.timezone).endOf('day').valueOf()
                    params.toDate = timeZone;
                    break;
                case mealConstant.DAYS.ONE_WEEKS:
                    params.fromDate = moment_timzone().tz(headers.timezone).subtract(DAYS_CONST.SEVEN, 'days').startOf('day').valueOf();
                    timeZone = moment_timzone().tz(headers.timezone).endOf('day').valueOf()
                    params.toDate = timeZone;
                    console.log("############## current time zone #############",timeZone);
                    break;
                case mealConstant.DAYS.TWO_WEEKS:
                    params.fromDate = moment_timzone().tz(headers.timezone).subtract(DAYS_CONST.FOURTEEN, 'days').startOf('day').valueOf();
                    timeZone = moment_timzone().tz(headers.timezone).endOf('day').valueOf()
                    params.toDate = timeZone;
                    break;
                case mealConstant.DAYS.ONE_MONTH:
                    params.fromDate = moment_timzone().tz(headers.timezone).subtract(DAYS_CONST.ONE, 'month').startOf('day').valueOf();
                    timeZone = moment_timzone().tz(headers.timezone).endOf('day').valueOf()
                    params.toDate = timeZone;
                    break;
                case mealConstant.DAYS.ALL_TIME:
                    params.fromDate = moment_timzone().tz(headers.timezone).subtract(DAYS_CONST.ONE, 'year').startOf('day').valueOf();
                    timeZone = moment_timzone().tz(headers.timezone).endOf('day').valueOf()
                    params.toDate = timeZone;
                    break;
                default:
                    return Promise.reject(mealConstant.MESSAGES.ERROR.INVALID_DAYS);
            }

            let data;
            if(params.type === mealConstant.AVERAGE_TYPE.AVERAGES){
                data = await mealDaoV1.getGlucoseAverages(params, tokenData, glucoseInterval);
            }
            else{
                data = {};
            }
            data = encryptData(JSON.stringify(data));
            console.log("@@@@@@@@@@@@@@ averages data @@@@@@@@@@@@@@@", data);
            return mealConstant.MESSAGES.SUCCESS.GLUCOSE_AVERAGES(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function addDeviceHistory
     * @description Add the device data of patient
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.date
     * @param params.glucose array of glucose value object
     * @param params.lastDeviceDataUpdate 
     * @returns 
     */
    async addDeviceHistory(payload: MealRequest.Payload, tokenData: TokenData){
        try{
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MealRequest.AddDeviceData = JSON.parse(decryptedData);
            const validation = addDeviceHistory.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }
            const isUser = await mealDaoV1.findUserById(tokenData.userId);
            if (!isUser) return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);
            params.deviceType = isUser.device;
            let data = await mealDaoV1.addDeviceHistory(params, tokenData);
            data = encryptData(JSON.stringify(data));
            return mealConstant.MESSAGES.SUCCESS.DEVICE_DATA_ADDED(data)
        }
        catch(error){
            throw error;
        }
    }

     /**
     * @function getDeviceHistory
     * @description get the device data of patient
     * @param params.date
     * @returns array of device history
     */
    async getDeviceHistory(params: MealRequest.GetDeviceData, tokenData: TokenData){
        try{
            let data = await mealDaoV1.getDeviceHistory(params, tokenData);
            data = encryptData(JSON.stringify(data));
            return mealConstant.MESSAGES.SUCCESS.DEVICE_HISTORY(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function editGlucose
     * @payload payload contains encrypted data : decrypted params defined below
     * @description edit glucose for a meal
     * @param params.id meal id (required)
     * @param params.glucose glucose (required)
     * @returns 
     */
    async editGlucose(payload: MealRequest.Payload, tokenData: TokenData){
        try{
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: MealRequest.addGlucose = JSON.parse(decryptedData);
            const validation = editGlucose.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isUserExists = await mealDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            await mealDaoV1.editGlucose(params.data, isUserExists);
            return mealConstant.MESSAGES.SUCCESS.EDIT_GLUCOSE;
        }
        catch(error){
            throw error;
        }
    }

    async getPatientGlucoseData(params, tokedata:TokenData){
        try{
            const isUser = await mealDaoV1.findUserById(tokedata.userId);
            if (!isUser) return Promise.reject(mealConstant.MESSAGES.ERROR.USER_NOT_FOUND);
            let result = await mealDaoV1.getPatientGlucoseData(params, tokedata.userId, isUser);
            result = encryptData(JSON.stringify(result));
            return MESSAGES.SUCCESS.DETAILS(result)
        }
        catch(error){
            throw error;
        }
    }

    async getGlucoseAndRpmHistoryData(params: MealRequest.GlucoseHistory, tokeData: TokenData){
        try{
            if(tokeData.userType != USER_TYPE.ADMIN)return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
            const data = await mealDaoV1.getGlucoseAndRpmHistoryData(params);
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }
}

export const mealController = new MealController();
