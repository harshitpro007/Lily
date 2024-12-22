"use strict";

import { STATUS } from "@config/main.constant";
import { logger } from "@lib/logger";
import { encryptedDb } from "@utils/DatabaseClient";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { dateToTimestamp, toObjectId } from "@utils/appUtils";
import { GLUCOSE_PRANDIAL, MEDICATION_TYPE, RANGE } from "./medicationConstant";
import { createObjectCsvWriter } from "csv-writer";
import { SERVER } from "@config/environment";
import { imageUtil } from "@lib/ImageUtil";
import moment from "moment";
import { MEAL_CATEGORY } from "@modules/meal/v1/mealConstant";
export class MedicationDao extends EncryptionBaseDao {

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
	* @function addMedication
	* @description add the medication of patient
	*/
	async addMedication(params: MedicationRequest.addMedication) {
		try {
			const collection = encryptedDb.getMedicationEncryptedClient()
			return await this.insertOne(collection, params);
		} catch (error) {
			throw error;
		}
	}

	/**
	* @function isMedicationExists
	* @description check the medication is exist or not of particular day
	*/
	async isMedicationExists(params: MedicationRequest.addMedication){
		try{
			const collection = encryptedDb.getMedicationEncryptedClient()
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
	 * @function editMedication
	 * @description patient can edit their medication
	 */
	async editMedication(params: MedicationRequest.editMedication, userId: string){
		try{
			const collection = encryptedDb.getMedicationEncryptedClient();
			const query = {
				userId: toObjectId(userId),
				_id: toObjectId(params.medicationId)
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
	 * @function getMedicationLogs
	 * @description get the medicaiton of patient of the basis of date 
	 */
	async getMedicationLogs(params: MedicationRequest.getMedication, tokenData: TokenData){
		try{
			const collection = encryptedDb.getMedicationEncryptedClient();
			const date = await dateToTimestamp(params.date);
			const match: any = {};
			match.dateAsString = date;
			match.userId = toObjectId(tokenData.userId);

			const projection = {updated: 0}

			return await this.find(collection, match, {projection: projection}); 
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getPatientQuickSummary
	 * @description get the summary of meal and medication of an patient
	 */
	async getPatientQuickSummary(params: MedicationRequest.QuickSummary, tokenData: TokenData, glucoseInterval: number, userGlucoseInterval?: number){
		try{
			const mealColl = encryptedDb.getMealEncryptedClient();
			const aggPipe: any = []
			const match: any = {};

			match.userId = toObjectId(params.patientId);
			match.time = { "$gt": params.fromDate, "$lte": params.toDate };
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
			aggPipe.push({ $sort: { time: 1 } });

			aggPipe.push({
				$group: {
					_id: "$category",
					maxGlucose: { $max: glucoseField },
					averageGlucose: { $avg: glucoseField },
					totalGlucoseCount: { $sum: 1 },
					meals: {
						$push: {
							id: "$_id",
							glucose: glucoseFieldForMax ? glucoseFieldForMax : glucoseField,
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
					inRangeCount: "$inRangeCount",
					maxGlucose: "$maxGlucose",
					meal: {
						$arrayElemAt: [{
							$slice: [{
								$filter: {
									input: "$meals",
									as: "meal",
									cond: { $eq: ["$$meal.glucose", "$maxGlucose"] }
								}
							}, -1]
						}, 0]
					},
					totalRange: "$totalGlucoseCount"		
				}
			});
			
			if(!params.isExport){
				let data = await this.aggregate(mealColl, aggPipe);
				const mealIds = data.map(item => item.meal?.id);
				const meals = await this.find(mealColl, {_id: {$in: mealIds}}, {projection: {updated: 0, created: 0, isGlucoseExists: 0, isMealExists: 0, isMedicationExists:0}});
				const insulinAverage = await this.getInsulinAverage(params);
				const formatedData:any = await this.formatData(data, insulinAverage)
				const [lowRange, fastingInRange, fastingOutRange] = await Promise.all([
					this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseInterval === GLUCOSE_PRANDIAL.TWO ? "glucose_2hr" : "glucose"]: { "$gt": 0, "$lt": RANGE.LOW }}),
					this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseInterval === GLUCOSE_PRANDIAL.TWO ? "glucose_2hr" : "glucose"]: { "$gte": RANGE.LOW, "$lte": RANGE.FASTING_HIGH }, category: MEAL_CATEGORY.FASTING }),
					this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, [glucoseInterval === GLUCOSE_PRANDIAL.TWO ? "glucose_2hr" : "glucose"]: { "$gt": RANGE.FASTING_HIGH }, category: MEAL_CATEGORY.FASTING })
				]);
				let inRange, outRange;
				if(glucoseInterval === GLUCOSE_PRANDIAL.TWO){
					[inRange, outRange] = await Promise.all([
						this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose_2hr: { "$gte": RANGE.LOW, "$lte": RANGE.OTHER_HIGH }, category: { $in: [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH] } }),
						this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose_2hr: { "$gt": RANGE.OTHER_HIGH }, category: { $in: [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH] } })
					]);
				}
				else{
					[inRange, outRange] = await Promise.all([
						this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose: { "$gte": RANGE.LOW, "$lte": RANGE.HIGH }, category: { $in: [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH] } }),
						this.countDocuments(mealColl, { userId: toObjectId(params.patientId), time: { "$gt": params.fromDate, "$lte": params.toDate }, glucose: { "$gt": RANGE.HIGH }, category: { $in: [MEAL_CATEGORY.BREAKFAST, MEAL_CATEGORY.DINNER, MEAL_CATEGORY.LUNCH] } })
					]);
				}
				return {
					...formatedData, 
					meals: meals,
					lowRange : lowRange,
					inRange : inRange + fastingInRange,
					outRange : outRange + fastingOutRange,
				};
			}
			else{
				let result = await this.aggregate(mealColl, aggPipe);
				const insulinAverage = await this.getInsulinAverage(params);
				const formatedData:any = await this.formatData(result, insulinAverage)
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportToCSV(formatedData, params, `${tokenData.userId}_${date}__PatientSummary.csv`)),
				};
				return data;
			}
		}
		catch(error){
			throw error;
		}
	}

	async exportToCSV(data: any, params:MedicationRequest.QuickSummary, fileName: string) {
		const year = moment(params.fromDate).year().toString();
		const csvWriter = createObjectCsvWriter({
			path: `${SERVER.UPLOAD_DIR}/${fileName}`,
			header: [
			  { id: 'label', title: year },
			  { id: 'col1', title: `${data.headers[0]}(mg/dL)` },
			  { id: 'col2', title: `${data.headers[1]}(mg/dL)` },
			  { id: 'col3', title: `${data.headers[2]}(mg/dL)` },
			  { id: 'col4', title: `${data.headers[3]}(mg/dL)` }
			]
		  });
		  
		  const records = [
			{ label: 'Peak Post-Prandial', col1: data.peakPostPrandialRow[0], col2: data.peakPostPrandialRow[1], col3: data.peakPostPrandialRow[2], col4: data.peakPostPrandialRow[3] },
			{ label: 'Range', col1: data.rangeRow[0], col2: data.rangeRow[1], col3: data.rangeRow[2], col4: data.rangeRow[3] },
			{ label: 'Insulin Average', col1: data.insulinAverageRow[0], col2: data.insulinAverageRow[1], col3: data.insulinAverageRow[2], col4: data.insulinAverageRow[3] }
		  ];

		try {
			await csvWriter.writeRecords(records);
			return await imageUtil.uploadSingleMediaToS3(fileName);
		} catch (error) {
			console.error('Error writing CSV:', error);
		}
	}

	/**
	 * @function getInsulinAverage
	 * @description get the average of insulin between a time frame
	 * @returns average of insuline
	 */
	async getInsulinAverage(params: MedicationRequest.QuickSummary){
		try{
			const medicationColl = encryptedDb.getMedicationEncryptedClient();
			const aggPipe: any = [] // NOSONAR
			const match: any = {};

			match.userId = toObjectId(params.patientId);
			match.type = MEDICATION_TYPE.INSULIN;
			match.time = { "$gte": params.fromDate, "$lte": params.toDate };

			aggPipe.push({ $match: match });

			aggPipe.push({
				$group: {
					_id: "$category",
					averageInsulin:  { $avg: "$dosage" },
				}
			})

			aggPipe.push({
				$project: {
					_id: 0,
					category: "$_id",
					averageInsulin: {
						$ceil: "$averageInsulin"
					},
				}
			});

			return await this.aggregate(medicationColl, aggPipe);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @description formate the data of patient glucose logs for export the data in csv
	 */
	async formatData(result: any, insulinAverage: any) {
		try {
			const headers = ["Fasting", "Breakfast", "Lunch", "Dinner"];
			const peakPostPrandialRow = headers.map(header => {
				const item = result.find(item => item.category === header);
				return item ? item.averageGlucose || "--" : "--";
			  });
			  
			  const rangeRow = headers.map(header => {
				const item = result.find(item => item.category === header);
				return item ? `${item.inRangeCount} / ${item.totalRange}` : "--";
			  });
			  
			  const insulinAverageRow = headers.map(header => {
				const item = insulinAverage.find(item => item.category === header);
				return item ? item.averageInsulin || "--" : "--";
			  });
			const formattedData = {headers, peakPostPrandialRow, rangeRow, insulinAverageRow};
			return formattedData;
		}
		catch(error){
			throw error
		}
	}
	
}

export const mediactionDao = new MedicationDao();