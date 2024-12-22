"use strict";

import { STATUS } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { dateToTimestamp, toObjectId } from "@utils/appUtils";
import { EXERCISE_CATEGORY, EXERCISE_TYPE } from "./exerciseConstant";
export class ExerciseDao extends EncryptionBaseDao {

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
	* @function addExercise
	* @description add exercise details of patient
	*/
	async addExercise(params: ExerciseRequest.addExercise) {
		try {
			const collection = encryptedDb.getExcerciseEncryptedClient()
			return await this.insertOne(collection, params);
		} catch (error) {
			throw error;
		}
	}

	 /**
	* @function healthDetails
	* @description add health details of patient
	*/
	async healthDetails(params: ExerciseRequest.Health) {
		try {
			const exerciseColl = encryptedDb.getExcerciseEncryptedClient()	
			const query = {
				userId: params.userId,
				dateAsString: params.dateAsString,
				category: EXERCISE_CATEGORY.HEALTH
			}		
			return await this.findOneAndUpdate(exerciseColl, query, params, {upsert: true});
		} catch (error) {
			throw error;
		}
	}

	/**
	* @function isMedicationExists
	* @description check the medication is exist or not of particular day
	*/
	async isExerciseExists(params: MedicationRequest.addMedication){
		try{
			const collection = encryptedDb.getMedicationEncryptedClient()
			const date = params.date.split("T")[0];
			const query = {
				userId: params.userId,
				dateAsString: date,
				type: params.type,
			}

			return await this.findOne(collection, query);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getExercise
	 * @description get the exercise of patient of the basis of date
	 */
	async getExercise(params: MedicationRequest.getMedication, tokenData: TokenData){
		try{
			const collection = encryptedDb.getExcerciseEncryptedClient();
			const date = params.date.split("T")[0];
			const aggPipe:any = [
				{
					$match: {
						dateAsString: date,
						userId: toObjectId(tokenData.userId),
						category: EXERCISE_CATEGORY.EXERCISE
					},
				},
				{
					$group: {
						_id: "$type",
						totalDistance: { $sum: "$distance" }, 
						totalDuration: { $sum: "$duration" },
						steps: { $sum: "$steps" },
						dateAsString: { $first: "$dateAsString" },
						userId: { $first: "$userId" },
						intensity: { $first: "$intensity" }
					},
				},
				{
					$project: {
						_id: 0,
						type: "$_id",
						totalDistance: 1,
						totalDuration: 1,
						dateAsString: 1,
						userId: 1,
						steps:1,
						intensity: 1
					},
				},
			];
			
			let exercises = await this.aggregate(collection, aggPipe);
			const data = await this.health(params,tokenData);

			exercises = await this.mergeExerciseData(exercises,data)
			return {exercises, health: data};
		}
		catch(error){ //NOSOANR
			throw error;
		}
	}

	/**
	 * @function mergeExerciseData
	 * @description merge the exercise data with sync data
	 */
	async mergeExerciseData(exercises, data){
		const findExerciseIndex = (exercises, type) => {
			return exercises.findIndex(exercise => exercise.type === type);
		};
		if (data?.walking) { //NOSOANR
			const index = findExerciseIndex(exercises, EXERCISE_TYPE.WALKING);
			if (index !== -1) { 
				exercises[index].walkingSync = data.walking;
			}
			else {
				exercises.push({
					type: EXERCISE_TYPE.WALKING,
					dateAsString: data.dateAsString,
					userId: data.userId,
					walkingSync: data.walking
				});
			}
		}
		if (data?.cycling) { //NOSOANR
			const index = findExerciseIndex(exercises, EXERCISE_TYPE.CYCLING);
			if (index !== -1) {
				exercises[index].cyclingSync = data.cycling;
			}
			else {
				exercises.push({
					type: EXERCISE_TYPE.CYCLING,
					dateAsString: data.dateAsString,
					userId: data.userId,
					cyclingSync: data.cycling
				});
			}
		}
		if (data?.yoga) { //NOSOANR
			const index = findExerciseIndex(exercises, EXERCISE_TYPE.YOGA);
			if (index !== -1) {
				exercises[index].yogaSync = data.yoga;
			}
			else {
				exercises.push({
					type: EXERCISE_TYPE.YOGA,
					dateAsString: data.dateAsString,
					userId: data.userId,
					yogaSync: data.yoga
				});
			}
		}
		if (data?.swimming) { //NOSOANR
			const index = findExerciseIndex(exercises, EXERCISE_TYPE.SWIMMING);
			if (index !== -1) {
				exercises[index].swimmingSync = data.swimming;
			}
			else {
				exercises.push({
					type: EXERCISE_TYPE.SWIMMING,
					dateAsString: data.dateAsString,
					userId: data.userId,
					swimmingSync: data.swimming
				});
			}
		}
		return exercises;
	}

	/**
	 * @function health
	 * @description get the health data of patient of the basis of date
	 */
	async health(params: MedicationRequest.getMedication, tokenData: TokenData){
		try{
			const collection = encryptedDb.getExcerciseEncryptedClient();
			const date = params.date.split("T")[0];

			const match = {
				dateAsString: date,
				userId: toObjectId(tokenData.userId),
				category: EXERCISE_CATEGORY.HEALTH
			}

			const projection = {
				_id: 0,
				heartRate: 1,
				sleep: 1,
				steps: 1,
				calories: 1,
				dateAsString: 1,
				userId: 1,
				lastSync: 1,
				walking: 1,
				cycling: 1,
				yoga: 1,
				swimming: 1
			}

			return await this.findOne(collection, match, projection );
		}
		catch(error){
			throw error;
		}
	}
	
}

export const exercisenDao = new ExerciseDao();