"use strict";
import {
    decryptData,
    encryptData,
    toObjectId,
} from "@utils/appUtils";
import {
    MESSAGES
} from "@config/index";
import * as exerciseConstant from "@modules/exercise/v1/exerciseConstant";
import { encryptedDb } from "@utils/DatabaseClient";
import { addExercise, Health } from "./routeValidation";
import { exerciseDaoV1 } from "..";
import moment from "moment";

export class ExerciseController {

    /**
     * @function addExercise
     * @payload payload contains encrypted data : decrypted params defined below
     * @description patient can add exercise details
     * @param params.intensity 
     * @param params.type
     * @param params.duration 
     * @param params.distance 
     * @param params.steps 
     * @returns 
     */
    async addExercise(payload: ExerciseRequest.Payload, tokenData: TokenData) {
        try {
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: ExerciseRequest.addExercise = JSON.parse(decryptedData);
            const validation = addExercise.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            const isUserExists = await exerciseDaoV1.findUserById(tokenData.userId);
            if(!isUserExists)return Promise.reject(exerciseConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            params.userId = toObjectId(tokenData.userId);
            params.time = moment(params.date).valueOf();
            params.dateAsString = params.date.split("T")[0];
            params.created = Date.now();
            params.category= exerciseConstant.EXERCISE_CATEGORY.EXERCISE;
            await exerciseDaoV1.addExercise(params);
            return exerciseConstant.MESSAGES.SUCCESS.EXERCISE_ADDED;
        }
        catch (error) {
            console.log("Error in adding exercise: ", error);
            throw error;
        }
    }

    /**
     * @function getExercise
     * @description get the exercise of patient of the basis of date
     * @param params.date date (required)
     * @returns exercise details
     */
    async getExercise(params: MedicationRequest.getMedication, tokenData: TokenData){
        try{
            const isUserExists = await exerciseDaoV1.findUserById(tokenData.userId)
            if(!isUserExists) return Promise.reject(exerciseConstant.MESSAGES.ERROR.USER_NOT_FOUND);

            let data = await exerciseDaoV1.getExercise(params,tokenData);
            data = encryptData(JSON.stringify(data));
            return MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            console.log("Error in getting medication logs: ", error);
            throw error;
        }
    }

        /**
     * @function healthDetails
     * @payload payload contains encrypted data : decrypted params defined below
     * @description patient can add medication's
     * @param @Health validator
     * @returns 
     */
        async healthDetails(payload: ExerciseRequest.Payload, tokenData: TokenData) {
            try {
                const userColl = encryptedDb.getUserEncryptedClient();
                let decryptedData = decryptData(payload.data);
                if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
                let params: ExerciseRequest.Health = JSON.parse(decryptedData);
                const validation = Health.validate(params);
                if (validation.error) {
                    return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
                }

                const isUserExists = await exerciseDaoV1.findUserById(tokenData.userId);
                if (!isUserExists) return Promise.reject(exerciseConstant.MESSAGES.ERROR.USER_NOT_FOUND);

                params.userId = toObjectId(tokenData.userId);
                params.time = moment(params.date).valueOf();
                params.dateAsString = params.date.split("T")[0];
                params.created = Date.now();
                params.category = exerciseConstant.EXERCISE_CATEGORY.HEALTH
                await exerciseDaoV1.healthDetails(params);
                await exerciseDaoV1.findOneAndUpdate(userColl, {_id: toObjectId(tokenData.userId)}, {isHealthAppConnected: true});
                return exerciseConstant.MESSAGES.SUCCESS.HEALTH_ADDED;
            }
            catch (error) {
                console.log("Error in health addititon: ", error);
                throw error;
            }
        }
}

export const exerciseController = new ExerciseController();
