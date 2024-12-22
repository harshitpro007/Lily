"use strict";

import { DAYS_CONST, DEVICE_TYPE, STATUS, USER_TYPE } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { chunkArray, dateToTimestamp, encryptData, getFormattedDate, toObjectId } from "@utils/appUtils";
import moment from "moment";
import { createObjectCsvWriter } from "csv-writer";
import { SERVER } from "@config/environment";
import { imageUtil } from "@lib/ImageUtil";
import { GLUCOSE_PRANDIAL, LOGS_DAYS, MEAL_CATEGORY, RANGE, RPM_TYPE, UNIT } from "./mealConstant";
import { axiosService } from "@lib/axiosService";
import { DEVICE, GLUCOSE_INTERVAL, MAIL_TYPE } from "@modules/user/v1/userConstant";
import moment_timzone from "moment-timezone";
import fs from 'fs';
import { EXERCISE_CATEGORY } from "@modules/exercise/v1/exerciseConstant";
export class MealDao extends EncryptionBaseDao {

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

			const projection = (Object.values(project).length) ? project : { created: 0, updated: 0 };
			const collection = encryptedDb.getUserEncryptedClient();
			return await this.findOne(collection, query, projection);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

	/**    
	 * @function findMealById
	 * @description fetch all details of meal on basis of _id (mealId)
	 */
	async findMealById(params: MealRequest.MealId, tokenData: TokenData, project = {}){
		try{
			const collection = encryptedDb.getMealEncryptedClient();
			const query: any = {};
			query._id = toObjectId(params.mealId);
			query.userId = toObjectId(tokenData.userId);

			const projection = (Object.values(project).length) ? project : { updated: 0 };
			return await this.findOne(collection,query,{projection:projection});
		}
		catch(error){
			logger.error(error);
			throw error;
		}
	}

	/**
	 * @function getMealMedication
	 * @description get the details of meal and medication on the basis of date and category
	 */
	async getMealMedication(params: MealRequest.getMeal, userDetails, userType, project = {}){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const medicationColl = encryptedDb.getMedicationEncryptedClient();
			const devicehistoryColl = encryptedDb.getDeviceHsitoryEncryptedClient();
			const date = await dateToTimestamp(params.date);
			const query: any = {};
			query.userId = toObjectId(params.userId);
			query.category = params.category;
			query.dateAsString = date;

			let projection:any = (Object.values(project).length) ? project : { updated: 0 };
			const projection1 = {_id:0,medicationId: "$_id", dosage: 1, name: 1, type: 1, medicationCreated: "$created", userId: 1, date: 1};
			let meal:any =  await this.findOne(mealColl, query, {projection: projection});
			if(userType == USER_TYPE.USER && meal && meal.category != MEAL_CATEGORY.FASTING){
				if (userDetails?.glucoseInterval && userDetails.glucoseInterval == 2) {
					if(meal?.glucose_2hr){
						meal.glucose = meal?.glucose_2hr;
						delete meal?.glucose_2hr;
					}
					else if(meal?.glucose && !meal?.glucose_2hr){
						delete meal?.glucose;
					}
				}
				else{
					if(meal?.glucose_2hr){
						delete meal?.glucose_2hr;
					}
				}
			}

			const medication = await this.findOne(medicationColl, query, { projection: projection1 });
			const data = await this.getGraphDeviceData(params, date);

			return { ...meal, ...medication, data };
		}
		catch(error){
			logger.error(error);
			throw error;
		}
	}


	async getGraphDeviceData(params, date){
		try{
			const formattedDate = moment(date, 'YYYY-MM-DD').format('MM-DD-YYYY');
			const deviceHistoryModel = encryptedDb.getDeviceHsitoryEncryptedClient();
			const match = {
				userId: toObjectId(params.userId),
				date: formattedDate
			}

			const pipeline: any = [
				{ $match: match },
				{ $unwind: "$glucose" }, 
				{
					$group: {
						_id: "$date",
						data: {
							$push: {
								time: "$glucose.time",
								timeInMsec: "$glucose.timeInMsec",
								value: "$glucose.value"
							}
						}
					}
				},
				{
					$project: {
						date: "$_id",
						data: 1
					}
				},
			];
			const data = await this.aggregate(deviceHistoryModel,pipeline);
			return data;
		}
		catch(error){
			throw error;
		}
	}
	/**
	* @function addMeal
	* @description add the meal of patient
	*/
	async addMeal(params: MealRequest.addMeal) {
		try {
			const collection = encryptedDb.getMealEncryptedClient()
			const date = params.date.split("T")[0];
			const query = {
				userId: toObjectId(params.userId),
				dateAsString: date,
				category: params.category
			}
			const options = {
				upsert: true,
			}
			return await this.findOneAndUpdate(collection, query, params, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	* @function addGlucose
	* @description add the meal of patient
	*/
	async addGlucose(params) {
		try {
			const collection = encryptedDb.getMealEncryptedClient();
			for (const item of params) {
				const date = item.date.split("T")[0];
				const query = {
					userId: item.userId,
					dateAsString: date,
					category: item.category
				};
				
				const isMealExists = await this.findOne(collection,query);
				const update:any = {}
				if (!isMealExists) {
					update.isMealExists = false;
					update.isMedicationExists = false;
				}

				if(item.glucose_2hr){
					update.glucose_2hr = item.glucose_2hr;
				}
				if(item.glucose){
					update.glucose = item.glucose;
				}
				if(item.category === MEAL_CATEGORY.FASTING){
					update.glucose_2hr = item.glucose
					item.isGlucoseExist2hr = true;
				}
				update.unit = item.glucoseUnit;
				update.isGlucoseExists = item.isGlucoseExists;
				update.isGlucoseExist2hr = item.isGlucoseExist2hr;
				update.time = item.time;
				update.date = item.date;
				update.dateAsString = item.dateAsString;
				// Update or insert the meal data
				await this.findOneAndUpdate(collection,query,update,{ upsert: true });
			}
			return true;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function isMealAdded
	 * @description check is meal added or not
	 */
	async isMealExists(params: MealRequest.addMeal){
		try{
			const collection = encryptedDb.getMealEncryptedClient();
			const date = params.date.split("T")[0];
			const query = {
				userId: params.userId,
				dateAsString: date,
				category: params.category,
			}
			return await this.findOne(collection, query);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function editMeal
	 * @description patient can edit their meal
	 */
	async editMeal(params: MealRequest.editMeal, userId: string){
		try{
			const collection = encryptedDb.getMealEncryptedClient();
			const query = {
				userId: toObjectId(userId),
				_id: toObjectId(params.mealId)
			}

			const projection = { updated: 0 }
			const data = await this.updateOne(collection, query, params, {projection: projection});
			return data;
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getGlucoseLogs
	 * @description get the list of glucose logs for home
	 */
	async getGlucoLive(params: MealRequest.getMeal, tokenData: TokenData,timezone:string,offset:number, userData){
		try{
			console.log('timestamp before offset',moment_timzone().tz(timezone).valueOf());
			const timezoneTimestamp= moment_timzone().tz(timezone).valueOf()+offset;
			console.log('timezoneTimestamp',timezoneTimestamp);
			const mealColl = encryptedDb.getMealEncryptedClient();
			const aggPipe:any = []; // NOSONAR
			const match: any = {}
			match.userId = toObjectId(tokenData.userId);
			match.time = {"$lte" :timezoneTimestamp};
			aggPipe.push({ $match: match });

			aggPipe.push({
				$group: {
					_id: "$dateAsString",
					glucose: {
						$push: {
							_id: "$_id",
							category: "$category",
							userId: "$userId",
							date: "$date",
							glucose: {
								$cond: {
									if: {
										$and: [
											{ $ne: [userData.glucoseInterval, null] },
											{ $eq: [userData?.glucoseInterval, 2] },
											{ $ne: ["$category", MEAL_CATEGORY.FASTING] }
										]
									},
									then: "$glucose_2hr",
									else: "$glucose"
								}
							},
							isMealExists: "$isMealExists",
							isDescOrImageExists: "$isDescOrImageExists",
							isGlucoseExists: "$isGlucoseExists",
							isGlucoseExist2hr: "$isGlucoseExist2hr",
							isMedicationExists: "$isMedicationExists",
							medicationType: "$medicationType",
							dateAsString: "$dateAsString",
							mealTime: "$mealTime",
							isAutomatic: "$isAutomatic",
							medicationTime: "$medicationTime"
						}
					},
					dateAsString: { $first: "$dateAsString" }
				}
			});

			aggPipe.push({$sort: {dateAsString: -1}});

			if (params.limit && params.pageNo) {
				const [skipStage, limitStage] = this.addSkipLimit(
					params.limit,
					params.pageNo,
				);
				aggPipe.push(skipStage, limitStage);
			}

			aggPipe.push({
				$project: {
					_id: 0,
					date: "$dateAsString",
					glucose: "$glucose"
				}
			});
			const result = await this.aggregateAndPaginate(mealColl, aggPipe, params.limit, params.pageNo, true);
			result.data = await Promise.all(result.data.map(async (data) => {
				const hasExercise = await this.checkExerciseForDate(tokenData.userId,data.date);
				return { ...data, isExerciseExists: hasExercise };
			}));

			result.data.forEach(entry => {
				entry.date += 'T00:00:00.000Z';
			  });

			const projection = {_id:1,category:1,date:1,glucose:1,userId:1,isMealExists:1,isGlucoseExists:1, isMedicationExists: 1, medicationType: 1, mealTime: 1}
			if(result.data.length === 0 || (moment(result.data[0].date).format('YYYY-MM-DD') !== moment_timzone().tz(timezone).format('YYYY-MM-DD') && params.pageNo === 1)){
				let glucose = await this.find(mealColl, {userId: toObjectId(tokenData.userId), time: {$gte: moment().startOf('day').valueOf(), $lte:moment().endOf('day').valueOf()}}, {projection: projection});
				const isExercise = await this.checkExerciseForDate(tokenData.userId,moment().format('YYYY-MM-DD'))
				const todayDateWithTimezone= moment_timzone().tz(timezone).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
				const today = {date: todayDateWithTimezone, glucose, isExerciseExists: isExercise};
				console.log('today',today);
				result.data.unshift(today);
			}
			return result;
		}
		catch(error){
			throw error;
		}
	}

	async checkExerciseForDate(userId: string, date){
		try{
			const exerciseColl = encryptedDb.getExcerciseEncryptedClient();
			const exercises = await this.find(exerciseColl,{ userId: toObjectId(userId), dateAsString: date });
			return exercises.length > 0;
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getMealLogs
	 * @description get the meals of patient of the basis of date
	 */
	async getMealLogs(params: MealRequest.getMeal, tokenData: TokenData, userData){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const date = await dateToTimestamp(params.date);
			const match: any = {};
			match.dateAsString = date;
			match.isMealExists = true;
			match.userId = toObjectId(tokenData.userId);

			const projection = {
				category:1,
				dateAsString:1,
				userId:1,
				created:1,
				date:1,
				glucose: {
					$cond: {
						if: { $and: [{ $ne: [userData.glucoseInterval, null] }, { $eq: [userData.glucoseInterval, 2] }, { $ne: ["$category", MEAL_CATEGORY.FASTING] }] },
						then: "$glucose_2hr",
						else: "$glucose",
					},
				},
				isDescOrImageExists:1,
				isGlucoseExist2hr:1,
				isGlucoseExists:1,
				isMealExists:1,
				isMedicationExists:1,
				medicationType:1,
				medicationTime:1,
				mealTime:1,
				time:1,
				unit:1,
				carbs:1,
				glucoseInRange:1,
				description:1,
				image:1,
				mealId:1,
				notes:1,
				isAutomatic:1
			}

			return await this.find(mealColl, match, {projection: projection}); 
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getPatientGlucoseLogs
     * @description get the logs of glucose of a patient
	 */
	async getGlucoseLogs(params: MealRequest.GlucoseLogs, tokenData: TokenData, glucoseInterval: number, userGlucoseInterval?: number){
		try{
			const collection = encryptedDb.getMealEncryptedClient();
			const aggPipe: any = []
			const match: any = {};

			match.userId = toObjectId(params.patientId);
			match.time = { "$gte": params.fromDate, "$lte": params.toDate };
			if(glucoseInterval === GLUCOSE_PRANDIAL.TWO){
				match.glucose_2hr = { "$gt": 0 };
			}
			else{
				match.glucose = { "$gt": 0 };
			}
			let glucoseField = { $cond: { if: { $eq: [glucoseInterval, 2] }, then: "$glucose_2hr", else: "$glucose" } };
			let glucoseFieldForMax;
			if(glucoseInterval == 3){
				glucoseFieldForMax = { 
					$cond: { 
						if: { $eq: [glucoseInterval, 3] }, 
						then: { $max: ["$glucose", "$glucose_2hr"] },
						else: "$glucose"
					} 
				};
				glucoseField = { $cond: { if: { $eq: [userGlucoseInterval, 2] }, then: "$glucose_2hr", else: "$glucose" } }
			}

			aggPipe.push({ $match: match });
			aggPipe.push({ $sort: { time: -1 } });

			aggPipe.push({
				$group: {
					_id: "$category",
					maxGlucose: { $max: glucoseField },
					averageGlucose: { $avg: glucoseField },
					totalGlucoseCount: { $sum: 1 },
					meals: {
						$push: {
							category: "$category",
							userId: "$userId",
							date: "$date",
							glucose: glucoseFieldForMax ? glucoseFieldForMax : glucoseField,
							glucoseInRange: "$glucoseInRange"
						}
					},
					inRangeCount: {
						$sum: {
							$cond: {
								if: {
									$and: [
										{ $gte: [glucoseField, RANGE.LOW] },
										{
											$cond: {
												if: { $eq: ["$category", MEAL_CATEGORY.FASTING] },
												then: { $lte: [glucoseField, RANGE.FASTING_HIGH] },
												else: { $lte: [glucoseField, { $cond: [{ $eq: [glucoseInterval, 2] }, RANGE.OTHER_HIGH, RANGE.HIGH] }] }
											}
										}
									]
								},
								then: 1,
								else: 0
							}
						}
					}
				}
			});

			aggPipe.push({
				$project: {
					_id: 0,
					category: "$_id",
					averageGlucose: {
						$ceil: "$averageGlucose"
					},
					maxGlucose: "$maxGlucose",
					meals: "$meals",
					inRangeCount: "$inRangeCount",
					totalRange: "$totalGlucoseCount"
				}
			});

			aggPipe.push({ $sort: { category: 1 } });
			if(!params.isExport){
				let data = await this.aggregate(collection, aggPipe);
				const exerciseData = await this.getExerciseData(params)
				return {data:data, exercise: exerciseData};
			}
			else{
				const result = await this.aggregate(collection,aggPipe);
				const exerciseData = await this.getExerciseData(params);
				const allDates = Array.from(new Set(result.flatMap(item => item.meals.map(meal => meal.date)))).sort((a:any, b:any) => new Date(a).getTime() - new Date(b).getTime());
				const allExerciseDates = Array.from(new Set(exerciseData.dailyDurations.map((item: any) => item.date))).sort((a: any, b: any) => new Date(a).getTime() - new Date(b).getTime());
				const formatedData = await this.formateData(result,allDates, exerciseData,allExerciseDates )
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportToCSV(formatedData, allDates, `${tokenData.userId}_${date}__GlucoseLogs.csv`)),
				};
				if (params.type === LOGS_DAYS.ALL_TIME && params.isExport) {
					let mailData = {
						type: MAIL_TYPE.GLUCOSE_DATA,
						email: tokenData.email,
						link: data.url,
					}
					mailData = encryptData(JSON.stringify(mailData));
					axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData } });
				}
				return data;
			}
		}
		catch (error) {
			throw error;
		}
	}

	async getExerciseData(params){
		try{
			const exerciseModel = encryptedDb.getExcerciseEncryptedClient();
			const aggPipe: any = []
			const match: any = {};

			match.userId = toObjectId(params.patientId);
			match.time = { "$gt": params.fromDate, "$lte": params.toDate };
			match.category = EXERCISE_CATEGORY.EXERCISE;

			aggPipe.push({ $match: match });
			aggPipe.push({ $sort: { time: 1 } });

			aggPipe.push({
				$group: {
				  _id: "$date",
				  totalDuration: { $sum: "$duration" }
				}
			});

			
			aggPipe.push({
				$project: {
					date: "$_id",
					totalDuration: 1,
					averageDuration: 1
				}
			});
			
			const dailyDurations = await this.aggregate(exerciseModel, aggPipe);

			const totalDurationSum = dailyDurations.reduce((sum, record) => sum + record.totalDuration, 0);
			let averageDuration = dailyDurations.length > 0 ? totalDurationSum / dailyDurations.length : 0;
			averageDuration = Math.ceil(averageDuration);
			return { dailyDurations, averageDuration };
		}
		catch(error){
			throw error;
		}
	}

	async exportToCSV(data: any[], allDates: any[], fileName: string) {
		const formattedDates = allDates.map(date => getFormattedDate(date));
		const csvWriter = createObjectCsvWriter({
			path: `${SERVER.UPLOAD_DIR}` + fileName,
			header: [
				{ id: 'category', title: 'Category' },
				{ id: 'averageGlucose', title: 'Average' },
				{ id: 'inRangeCount', title: 'In Range' },
				...formattedDates.map(date => ({ id: date, title: date }))
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
	 * @function formateData
	 * @description formate the data of patient glucose logs for export the data in csv
	 */
	async formateData(result: any, allDates: any, exerciseData, allExerciseDates){
		try{
			const formattedDates = allDates.map(date => getFormattedDate(date));
			const formattedExerciseDates = allExerciseDates.map(date => getFormattedDate(date));
			const formatedData = result.map((item) => {
				const dateGlucoseMap: any = formattedDates.reduce((acc: { [key: string]: string }, date: string) => {
					const mealsForDate = item.meals.filter(meal => getFormattedDate(meal.date) === date);
					if (mealsForDate.length > 0) {
						acc[date] = mealsForDate.map(meal => meal.glucose || '--').join(', ');
					} else {
						acc[date] = '--';
					}
					return acc;
				}, {});
			
				return {
					category: item.category,
					averageGlucose: item.averageGlucose,
					averageEcercise: exerciseData.averageDuration,
					inRangeCount: `${item.inRangeCount} / ${item.totalRange}`,
					...dateGlucoseMap
				};
			});
			return formatedData;
		}
		catch(error){
			throw error;
		}
	}

	/**
     * @function getPatientCgmDetails
     * @description  get the summary of CGM of an patient
	*/
	async getPatientCgmDetails(params: MedicationRequest.QuickSummary, tokenData: TokenData){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const aggPipe:any = []; // NOSONAR
			const match: any = {}
			match.userId = toObjectId(params.patientId);
			match.time = { "$gte": params.fromDate, "$lte": params.toDate };
			match.glucose = { "$exists": true };
			const projection = {category: 1, date: 1, glucose: 1, userId: 1, time: 1}
			aggPipe.push({ $match: match });

			aggPipe.push({
				$group: {
					_id: "$dateAsString",
					glucose: {
						$push: {
							_id: "$_id",
							category: "$category",
							userId: "$userId",
							date: "$date",
							glucose: "$glucose",
							dateAsString: "$dateAsString",
							mealTime: "$mealTime"
						}
					},
					dateAsString: { $first: "$dateAsString" }
				}
			});

			aggPipe.push({$sort: {dateAsString: -1}});

			aggPipe.push({
				$project: {
					_id: 0,
					date: "$dateAsString",
					glucose: "$glucose"
				}
			});

			if(!params.isExport){
				const result = await this.aggregate(mealColl, aggPipe);
				result.forEach(entry => {
					entry.date += 'T00:00:00.000Z';
				});
				const data = await this.find(mealColl, match, {projection: projection});
				const cgmData = await this.getGlucoseData(params,data);
				const graphData = await this.getCgmGraphDeviceHistory(params)
				return {data:result, ...cgmData, graphData};
			}
			else{
				const result = await this.find(mealColl, match, {projection: projection});
				const cgmData = await this.getGlucoseData(params,result);
				console.log('EXPORTED DATA:*************',cgmData)
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportCgmDataToCSV(cgmData, `${tokenData.userId}_${date}__PatientCgmDetails.csv`)),
				};
				return data;
			}
		}
		catch(error){
			throw error;
		}
	}

	async exportCgmDataToCSV(data: any, fileName: string) {
		data.maxMinGlucose = `${data.maxGlucose}/${data.minGlucose}`;
		const csvWriter = createObjectCsvWriter({
			path: `${SERVER.UPLOAD_DIR}` + fileName,
			header: [
				{ id: 'cgmActiveTime', title: 'CGM Active Time' },
				{ id: 'avgGlucose', title: 'Avg. Glucose' },
				{ id: 'maxMinGlucose', title: 'Weekly Max/Min' },
				{ id: 'gmi', title: 'GMI' },
				{ id: 'coeffVariation', title: 'Coef Variation (CV)' },
			],
		});
	
		try {
			await csvWriter.writeRecords([data]);
			return await imageUtil.uploadSingleMediaToS3(fileName);
		} catch (error) {
			console.error('Error writing CSV:', error);
		}
	}

	/**
	 * @function getGlucoseData
	 * @description get the min, max and average value of glucose using from date and to date
	 */
	async getGlucoseData(params: MedicationRequest.QuickSummary, data: any[]){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const glucoseValues = data.map(entry => entry.glucose);
			const filteredValues = glucoseValues.filter(value => value > 0);
			const minGlucose = filteredValues.length > 0 ? Math.min(...filteredValues) : Math.min(...glucoseValues); 
			const maxGlucose = Math.max(...glucoseValues);
			let avgGlucose = filteredValues.length > 0 ? glucoseValues.reduce((sum, value) => sum + value, 0) / filteredValues.length : 0;
			avgGlucose = Math.ceil(avgGlucose);
			const lowRange = await this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose: { "$gt": 0, "$lt": RANGE.LOW } });
			const inRange = await this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose: { "$gte": RANGE.LOW, "$lte": RANGE.HIGH }, category: {$in : [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH]}});
			const fastingInRange = await this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte":  params.toDate }, glucose: { "$gte": RANGE.LOW, "$lte": RANGE.FASTING_HIGH }, category: MEAL_CATEGORY.FASTING });
			const outRange = await this.countDocuments(mealColl, {userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose: {"$gt": RANGE.HIGH}, category: {$in : [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH]}});
			const fastingOutRange = await this.countDocuments(mealColl, {userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose: {"$gt": RANGE.FASTING_HIGH}, category: MEAL_CATEGORY.FASTING});
			const glucoseValuesData = await this.find(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose :{ "$gt": 0 }}, {projection: { glucose:1 }});
			const totalGlucoseSum = glucoseValuesData.reduce((sum, record) => {
				return sum + (record.glucose || 0);  
			  }, 0);
			let measurementIndicatorMean;
			let coeffVariation;
			if(glucoseValuesData.length){
				measurementIndicatorMean = Math.ceil(totalGlucoseSum / glucoseValuesData?.length);
				const coeffVariationSum = glucoseValuesData.reduce((sum, record) => {
					const difference = record.glucose - measurementIndicatorMean;
					const squaredDifference = Math.pow(difference, 2);
					return sum + squaredDifference;
				  }, 0); 
				coeffVariation = Math.ceil(coeffVariationSum / glucoseValuesData?.length);
				coeffVariation = Math.sqrt(coeffVariation).toFixed(2);
			}
			else{
				measurementIndicatorMean = 0;
				coeffVariation = 0
			}
			const cgmActiveTime= params.cgmActiveTime?params.cgmActiveTime:"0";
			const gmi= params.gmi?params.gmi:"0";
			const cov= params.cov?params.cov:"0";
			return {minGlucose: minGlucose, maxGlucose: maxGlucose, avgGlucose: avgGlucose, lowRange: lowRange, inRange: inRange + fastingInRange, outRange: outRange + fastingOutRange, measurementIndicatorMean: measurementIndicatorMean, cgmActiveTime:cgmActiveTime,gmi:gmi,cov:cov,  coeffVariation: coeffVariation};
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getCgmGraphDeviceHistory 
	 * @returns 
	 */
	async getCgmGraphDeviceHistory(params: MealRequest.GetDeviceData){
		try{
			const deviceHistoryModel = encryptedDb.getDeviceHsitoryEncryptedClient();
			const match = {
				userId: toObjectId(params.patientId),
				created: { "$gte": params.fromDate, "$lte": params.toDate }
			}

			const pipeline: any = [
				{ $match: match },
				{ $unwind: "$glucose" }, 
				{
					$group: {
						_id: "$date",
						data: {
							$push: {
								time: "$glucose.time",
								timeInMsec: "$glucose.timeInMsec",
								value: "$glucose.value"
							}
						}
					}
				},
				{
					$project: {
						date: "$_id",
						data: 1
					}
				},
			];
			const data = await this.aggregate(deviceHistoryModel,pipeline);
			return data;
		}
		catch(error){
			throw error;
		}
	}

	/**
     * @function getGlucoseAverages
     * @description get the averages of glucose on the basis of days
     */
	async getGlucoseAverages(params: MealRequest.Averaves, tokenData: TokenData, glucoseInterval: number){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const aggPipe: any = [] // NOSONAR
			const match: any = {};
			console.log("From Date and To Date", params);
			const glucoseField = glucoseInterval === GLUCOSE_PRANDIAL.TWO ? "glucose_2hr" : "glucose";

			match.userId = toObjectId(tokenData.userId);
			match.time = { "$gte": params.fromDate, "$lte": params.toDate };
			match[glucoseField] = { "$gt": 0 };

			aggPipe.push({ $match: match });

			aggPipe.push({
				$group: {
					_id: "$category",
					averageGlucose: { $avg: `$${glucoseField}` },
				}
			});

			aggPipe.push({
				$project: {
					_id: 0,
					category: "$_id",
					averageGlucose: {
						$ceil: "$averageGlucose"
					},
				}
			});

			const result = await this.aggregate(mealColl,aggPipe);
			const currentDate = moment().endOf('day').valueOf();
			const fromDate = moment().subtract(DAYS_CONST.SEVEN, 'days').startOf('day').valueOf();
			const query: any = {
				userId: toObjectId(tokenData.userId),
				time: { "$gt": fromDate, "$lte": currentDate },
				[glucoseField]: { "$exists": true },
			};
			const projection = {category: 1, date: 1, [glucoseField]: 1, userId: 1, time: 1}
			const data = await this.find(mealColl, query, {projection: projection});
			const glucoseValues = data.map(entry => entry[glucoseField]);
			const maxGlucose = Math.max(...glucoseValues);
			const avgGlucose = glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length;
			let lowRange, inRange, outRange, fastingOutRange, breakfastInRange, fastingInRange, lunchInRange, dinnerInRange, totalBreakfastRange, totalFastingRange, totalLunchRange, totalDinnerRange;
			[lowRange, fastingOutRange, totalBreakfastRange, totalFastingRange, totalLunchRange, totalDinnerRange, fastingInRange] = await Promise.all([
				this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": fromDate, "$lte": currentDate }, [glucoseField]: { "$gt": 0, "$lt": RANGE.LOW } }),
				this.countDocuments(mealColl, {userId: toObjectId(tokenData.userId), time: { "$gt": fromDate, "$lte": currentDate }, [glucoseField]: {"$gt": RANGE.FASTING_HIGH}, category: MEAL_CATEGORY.FASTING}),
				this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseField]: { "$gt": 0 }, category: MEAL_CATEGORY.BREAKFAST }),
				this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseField]: { "$gt": 0 }, category: MEAL_CATEGORY.FASTING }),
				this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseField]: { "$gt": 0 }, category: MEAL_CATEGORY.LUNCH }),
				this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseField]: { "$gt": 0 }, category: MEAL_CATEGORY.DINNER }),
				this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.FASTING_HIGH }, category: MEAL_CATEGORY.FASTING })
			])
			if(glucoseInterval === GLUCOSE_INTERVAL.TWO){
				[inRange, outRange, breakfastInRange, lunchInRange, dinnerInRange] = await Promise.all([
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.OTHER_HIGH }, category: {$in : [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH]} }),
					this.countDocuments(mealColl, {userId: toObjectId(tokenData.userId), time: { "$gt": fromDate, "$lte": currentDate }, [glucoseField]: {"$gt": RANGE.OTHER_HIGH}, category: {$in : [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH]}}),
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.OTHER_HIGH }, category: MEAL_CATEGORY.BREAKFAST }),
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.OTHER_HIGH }, category: MEAL_CATEGORY.LUNCH }),
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.OTHER_HIGH }, category: MEAL_CATEGORY.DINNER })
				])
			}
			else{
				[inRange, outRange, breakfastInRange, lunchInRange, dinnerInRange] = await Promise.all([
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.HIGH }, category: {$in : [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH]} }),
					this.countDocuments(mealColl, {userId: toObjectId(tokenData.userId), time: { "$gt": fromDate, "$lte": currentDate }, [glucoseField]: {"$gt": RANGE.HIGH}, category: {$in : [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH]}}),
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.HIGH }, category: MEAL_CATEGORY.BREAKFAST }),
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.HIGH }, category: MEAL_CATEGORY.LUNCH }),
					this.countDocuments(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gt": params.fromDate, "$lte": currentDate }, [glucoseField]: { "$gte": RANGE.LOW, "$lte": RANGE.HIGH }, category: MEAL_CATEGORY.DINNER })
				])
			}
			lowRange = ((lowRange / glucoseValues.length) * 100).toFixed(2);
			inRange = (((inRange + fastingInRange) / glucoseValues.length) * 100).toFixed(2);
			outRange = (((outRange + fastingOutRange) / glucoseValues.length) * 100).toFixed(2);
			const glucoseValuesData = await this.find(mealColl, { userId: toObjectId(tokenData.userId), time: { "$gte": params.fromDate, "$lte": currentDate }, [glucoseField] :{ "$gt": 0 }}, {$project: {glucoseField: `$${glucoseField}`}});
			const totalGlucoseSum = glucoseValuesData.reduce((sum, record) => {
				return sum + (record.glucoseField || 0);  
			  }, 0);
			let measurementIndicatorMean;
			if(glucoseValuesData.length){
				measurementIndicatorMean = Math.ceil(totalGlucoseSum / glucoseValuesData?.length);
			}
			else{
				measurementIndicatorMean = 0
			}
			return {
				averages: result,
				lowRange,
				inRange,
				outRange,
				avgGlucose,
				maxGlucose,
				breakfastInRange,
				fastingInRange,
				lunchInRange,
				dinnerInRange,
				totalBreakfastRange: totalBreakfastRange,
				totalFastingRange: totalFastingRange,
				totalLunchRange: totalLunchRange,
				totalDinnerRange: totalDinnerRange,
				measurementIndicatorMean: measurementIndicatorMean
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
   	* @function updateDeviceData
   	* @description update the device data of user on the basis of glucose
   	*/
	async updateDeviceData(){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const userColl = encryptedDb.getUserEncryptedClient();

			const users = await this.distinct(userColl, "_id", {status: STATUS.ACTIVE});
			const previousDay = moment().subtract(DAYS_CONST.ONE, 'day').format('YYYY-MM-DD');
			const fastingIds = await this.distinct(mealColl, 'userId', {category: MEAL_CATEGORY.FASTING, dateAsString: previousDay});
			const fastingIdsStr = fastingIds.filter(id => id).map(id => id.toString());
			const usersWithoutFasting = users.filter(user => !fastingIdsStr.includes(user.toString()));
			const breakfastIds = await this.distinct(mealColl, 'userId', {category: MEAL_CATEGORY.BREAKFAST, dateAsString: previousDay});
			const breakfastIdsStr = breakfastIds.filter(id => id).map(id => id.toString());
			const usersWithoutBreakfast = users.filter(user => !breakfastIdsStr.includes(user.toString()));
			const lunchIds = await this.distinct(mealColl, 'userId', {category: MEAL_CATEGORY.LUNCH, dateAsString: previousDay});
			const lunchIdsStr = lunchIds.filter(id => id).map(id => id.toString());
			const usersWithoutLunch = users.filter(user => !lunchIdsStr.includes(user.toString()));
			const dinnerIds = await this.distinct(mealColl, 'userId', {category: MEAL_CATEGORY.DINNER, dateAsString: previousDay});
			const dinnerIdsStr = dinnerIds.filter(id => id).map(id => id.toString());
			const usersWithoutDinner = users.filter(user => !dinnerIdsStr.includes(user.toString()));
			
			await this.insertDeviceData(usersWithoutFasting, previousDay, MEAL_CATEGORY.FASTING),
			await this.insertDeviceData(usersWithoutBreakfast, previousDay, MEAL_CATEGORY.BREAKFAST),
			await this.insertDeviceData(usersWithoutLunch, previousDay, MEAL_CATEGORY.LUNCH),
			await this.insertDeviceData(usersWithoutDinner, previousDay, MEAL_CATEGORY.DINNER)
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function insertDeviceData
	 */
	async insertDeviceData(userIds: any, date: string, category: string){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const mealDate = moment().subtract(DAYS_CONST.ONE, 'day').endOf('day').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
			const time = moment(mealDate).valueOf();

			if (!userIds || userIds.length === 0) {
				console.log("No userIds provided for insertion.");
				return;
			}

			const bulkOps = userIds.map(user => {
				const document:any = {
					userId: user,
					category: category,
					glucose: 0,
					glucose_2hr: 0,
					unit: UNIT.GLUCOSE_UNIT,
					isGlucoseExists: false,
					isGlucoseExist2hr: false,
					isMealExists: false,
					isMedicationExists: false,
					dateAsString: date,
					date: mealDate,
					time: time,
					created: Date.now(),
					updated: Date.now()
				};
			
				// Add isAutomatic key if category is Fasting
				if (category === MEAL_CATEGORY.FASTING) {
					document.isAutomatic = true;
				}
			
				return { insertOne: { document } };
			});

			// Execute bulk write
			const result = await mealColl.bulkWrite(bulkOps);
			console.log("Bulk glucose insert result:", result);
			return true;
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function addDeviceHistory 
	 * @returns 
	 */
	async addDeviceHistory(params: MealRequest.AddDeviceData, tokenData: TokenData){
		try{
			const deviceHistoryModel = encryptedDb.getDeviceHsitoryEncryptedClient();
			const userModel = encryptedDb.getUserEncryptedClient();
			params.userId = toObjectId(tokenData.userId);
			params.status = STATUS.ACTIVE
			console.log("params ########", params);
			await this.insertOne(deviceHistoryModel, params);
			const length = params.glucose.length;
			if(params.deviceType == DEVICE.DEXCOM_G7){
				const user = await this.findOne(userModel, {_id: toObjectId(tokenData.userId)});
				const offset = user.offset ? user.offset : 0;
				let libreGraphLastTimeInterval = params.glucose[length - 1]?.timeInMsec + offset;
				await this.findOneAndUpdate(userModel, {_id: toObjectId(tokenData.userId)}, {libreGraphLastTimeInterval: libreGraphLastTimeInterval});
			}
			else{
				await this.findOneAndUpdate(userModel, {_id: toObjectId(tokenData.userId)}, {libreGraphLastTimeInterval: params.glucose[length-1]?.timeInMsec});
			}
			return {timeInMsec:params.glucose[length-1]?.timeInMsec};
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getDeviceHistory 
	 * @returns 
	 */
	async getDeviceHistory(params: MealRequest.GetDeviceData, tokenData: TokenData){
		try{
			const deviceHistoryModel = encryptedDb.getDeviceHsitoryEncryptedClient();
			const match = {
				userId: toObjectId(tokenData.userId),
				date: params.date
			}

			const pipeline: any = [
				{ $match: match },
				{
					$group: {
						_id: "$date",
						data: {
							$push: {
								glucose: "$glucose"
							}
						}
					}
				},
				{
					$project: {
						_id: 0,
						glucoseData: "$data"
					}
				}
			];
			const data = await this.aggregate(deviceHistoryModel,pipeline);
			if(data[0]){
				if(data[0]?.glucoseData){
					const combinedGlucose = Object.values(data[0].glucoseData).flatMap((item:any) => item.glucose);
    				return { glucose: combinedGlucose };
				}
			}
			else{
				return {glucose: []};
			}
		}
		catch(error){
			throw error;
		}
	}

	/**
     * @function editGlucose
     * @description edit glucose for a meal
     */
	async editGlucose(params, userData){
		try{
			const collection = encryptedDb.getMealEncryptedClient();
			for (const item of params) {
				const query = {
					_id: toObjectId(item.id)
				};
				const mealData = await this.findOne(collection, query);
				const update: any = {}
				if(item.glucose_2hr){
					update.glucose_2hr = item.glucose_2hr;
				}
				if(item.glucose){
					update.glucose = item.glucose;
				}

                let isGlucoseExists;
				let isGlucoseExist2hr;
                if(item?.glucose && item?.glucose > 0){
					isGlucoseExists = true;
					update.isGlucoseExists = isGlucoseExists;
				}
				if(item?.glucose_2hr && item?.glucose_2hr > 0){
					isGlucoseExist2hr = true;
					update.isGlucoseExist2hr = isGlucoseExist2hr;
				}
				if(mealData.category === MEAL_CATEGORY.FASTING){
					update.glucose_2hr = item.glucose;
					isGlucoseExist2hr = true;
					update.isGlucoseExist2hr = isGlucoseExist2hr;
				}
				// Update the meal data
				const meal= await this.findOneAndUpdate(collection, query, update);
			}
			return true;
		}
		catch(error){
			throw error;
		}
	}

	async getPatientGlucoseData(params, userId, userDetails){
		try{
			const collection = encryptedDb.getMealEncryptedClient();
			const meals = await this.find(collection, {dateAsString: params.date, userId: toObjectId(userId)}, {projection: {userId:1,glucose:1,glucose_2hr:1, mealTime:1}});
			console.log(meals);
			let glucose: any[] = [];
			if (meals && meals.length > 1) {
				meals.forEach((meal: any) => {
					const formattedDate = moment(meal.mealTime).format('MM/DD/YYYY h:mm:ss A');
					const dateValue = moment(formattedDate, 'MM/DD/YYYY h:mm:ss A').valueOf();

					if(userDetails.glucoseInterval && userDetails.glucoseInterval == 2 && meal?.glucose_2hr){
						glucose.push(
							{
								time: formattedDate,
								value: meal.glucose_2hr,
								timeInMsec: dateValue,
							}
						);
					}
					else if((userDetails.glucoseInterval && userDetails.glucoseInterval == 1 && meal?.glucose) || (!userDetails.glucoseInterval && meal?.glucose)){
						glucose.push(
							{
								time: formattedDate,
								value: meal.glucose,
								timeInMsec: dateValue,
							}
						);
					}
				});
			}
			if(glucose.length > 1){
				return {glucose: glucose};
			}
			else{
				const glucose = []
				return {glucose: glucose};
			}
		}
		catch(error){
			throw error;
		}
	}

	async getGlucoseAndRpmHistoryData(params: MealRequest.GlucoseHistory){
		try{
			const patientColl = encryptedDb.getUserEncryptedClient();
			const clinicColl = encryptedDb.getProviderEncryptedClient();
			const [clinicData, patients] = await Promise.all([
				this.findOne(clinicColl, { clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN, status: { $ne: STATUS.DELETED } }),
				this.find(patientColl, { clinicId: params.clinicId, status: { $ne: STATUS.DELETED } }, { projection: { _id: 1, providerId: 1, firstName: 1, lastName: 1, dob: 1, dueDate: 1, device: 1 } })
			]);
			const patientsChunks = chunkArray(patients, SERVER.CHUNKS)
			const patientGlucoseData = await this.glucoseData(patientsChunks, clinicColl);
			const result = patientGlucoseData.map((entry) => ({
				...entry,
				clinicName: clinicData?.adminName
			}));
			
			let date = Date.now();
			const data: { url: string } = {
				url: String(await this.exportToText(result, `${date}__GlucoseAndRpmHistory.txt`)),
			};
			console.log(data);
			return data;
		}
		catch(error){
			throw error;
		}
	}

	async exportToText(data: any, fileName: string) {
		const filePath = `${SERVER.UPLOAD_DIR}` + fileName;
		const textData = data.map(entry => {
			return `{
    			"patientId": "${entry.patientId}",
				"patientFirstName": "${entry.firstName}",
				"patientLastName": "${entry.lastName}",
				"dob": "${entry.dob}",
				"device": "${entry.device}",
				"dueDate": "${entry.dueDate}",
    			"providerName": "${entry.providerName}",
				"providerNPI": "${entry.providerNPI}",
    			"rpmVisits": ${JSON.stringify(entry.rpmVisits, null, 2)},
				"trainingVisits": ${JSON.stringify(entry.generalVisits, null, 2)},
    			"glucoseDataHistory": ${JSON.stringify(entry.glucoseDataHistory, null, 2)},
    			"clinicName": "${entry.clinicName}"
			},`;
		}).join('\n');
		try {
			const arrayData = `[\n${textData}\n]`;
			fs.writeFileSync(filePath, arrayData);
			return await imageUtil.uploadSingleMediaToS3(fileName);
		} catch (error) {
			console.error('Error writing CSV:', error);
		}
	}

	async glucoseData(patientsChunks, clinicColl) {
		try {
			let patientGlucoseData: any[] = [];
			const mealColl = encryptedDb.getMealEncryptedClient();
			const rpmColl = encryptedDb.getrpmVisitEncryptedClient();
			for (const chunk of patientsChunks) {
				const results = await Promise.all(
					chunk.map(async (patient: any) => {
						const match = {
							userId: toObjectId(patient._id),
							$or: [
								{ isGlucoseExists: true },
								{ isGlucoseExist2hr: true }
							]
						};


						let [providerDetails, aggregatedData, rpmVisits, generalVisits] = await Promise.all([
							this.findOne(clinicColl, { _id: toObjectId(patient.providerId) }, { projection: { _id: 0, adminName: 1, organizationalNPI: 1 } }),
							this.distinct(mealColl, "dateAsString", match),
							this.find(rpmColl, { userId: toObjectId(patient._id), type: RPM_TYPE.RPM }, { projection: { _id: 0, date: 1, notes: 1, minutes: "$visitTime", isSynchronous: "$isInteraction" } }),
							this.find(rpmColl, { userId: toObjectId(patient._id), type: RPM_TYPE.TRAINING }, { projection: { _id: 0, date: 1, notes: 1 } })
						]);
						rpmVisits = rpmVisits.map(visit => ({
							...visit,
							date: moment(visit.date).format('YYYY-MM-DD'),
						}));
						generalVisits = generalVisits.map(visit => ({
							...visit,
							date: moment(visit.date).format('YYYY-MM-DD'),
						}));
						return {
							patientId: patient._id,
							firstName: patient?.firstName,
							lastName: patient?.lastName,
							dob: patient?.dob,
							device: patient?.device,
							dueDate: patient?.dueDate,
							providerName: providerDetails?.adminName,
							providerNPI: providerDetails?.organizationalNPI,
							rpmVisits: rpmVisits,
							generalVisits: generalVisits,
							glucoseDataHistory: aggregatedData,
						};
					})
				);

				patientGlucoseData = patientGlucoseData.concat(results.flat());
			}
			return patientGlucoseData
		}
		catch (error) {
			throw error;
		}
	}

	async updateFastingData(){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const currentDay = moment().format('YYYY-MM-DD');
			const fastingMeals = await this.find(mealColl, {dateAsString: currentDay, glucose: {"$eq": 0}, isGlucoseExists: false, category: MEAL_CATEGORY.FASTING});
			const fastingChunks = chunkArray(fastingMeals, SERVER.CHUNKS)
			await this.updateFatingGlucoseData(fastingChunks, mealColl, currentDay);
		}
		catch(error){
			throw error;
		}
	}

	async updateFatingGlucoseData(fastingChunks, mealColl, currentDay){
		try{
			const deviceHistoryColl = encryptedDb.getDeviceHsitoryEncryptedClient();
			for (const chunk of fastingChunks) {
				await Promise.all(
					chunk.map(async (fasting: any) => {
						const userId = fasting.userId;

						const date = moment().format('MM-DD-YYYY');
						const glucoseDate = moment().format('M/D/YYYY');

						const startTime = glucoseDate + " 4:00:00 AM"
						const endTime = glucoseDate + " 4:05:00 AM"
						try {
							// Query device history for glucose data around 4:00 AM
							const deviceHistory = await this.findOne(deviceHistoryColl,{
								userId: userId,
								date: date,
								glucose: {
									$elemMatch: {
										time: { $gte: startTime, $lte: endTime }
									}
								}
							});
							
							if (deviceHistory) {
								const glucoseData = deviceHistory.glucose.find(
									(g) => g.time == startTime && g.time <= endTime
								);
								if (glucoseData) {
									const glucoseValue = glucoseData.value;
									
									// Update the meal collection
									await this.updateOne(mealColl,
										{ userId: toObjectId(userId), dateAsString: currentDay, category: MEAL_CATEGORY.FASTING },
										{
											glucose: glucoseValue,
											glucose_2hr: glucoseValue,
											isGlucoseExists: true,
											isGlucoseExist2hr: true,
										}
									);
			
									console.log(
										`Updated glucose value for userId: ${userId} on ${date} with value: ${glucoseValue}`
									);
								}
							}
						} catch (error) {
							console.error(`Error processing userId: ${userId}`, error);
							throw error;
						}
					})
				);
			}
		}
		catch(error){
			throw error;
		}
	}
}

export const mealDao = new MealDao();