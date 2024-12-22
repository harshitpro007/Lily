import { STATUS, USER_TYPE } from "@config/main.constant";
import { logger } from "@lib/logger";
import { EncryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { encryptedDb } from "@utils/DatabaseClient";
import { toObjectId } from "@utils/appUtils";
import { LIMIT, SUBSCRIPTION_TYPE, TRANSACTION_STATUS, monthNames } from "./transactionConstant";
import { createObjectCsvWriter } from "csv-writer";
import { SERVER } from "@config/environment";
import { imageUtil } from "@lib/ImageUtils";
import moment from "moment";

export class TransactionDao extends EncryptionBaseDao {

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
	 * @param clinicId 
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
	 * @function addSubscription
	 * @description add subcription of the clinic
	 */
	async addTransaction(params: TransactionRequest.addTransaction){
		try{
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			return await this.insertOne(collection,params);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function finTransactionById
	 * @description find transaction with id
	 */
	async findTransactionById(params: TransactionRequest.transactionId){
		try{
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			return await this.findOne(collection,params);
		}
		catch(error){
			throw error;
		}
	}

	async updateTransactionById(params:any,update,options){
		try{
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			return await this.findOneAndUpdate(collection,params, update,options);
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getTransactionListing
	 * @description get the listing of transactions of a clinic
	 */
	async getTransactionListing(params: TransactionRequest.TransactionListing){
		try{
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			const aggPipe = []; //NOSONAR
			const match: any = {};

			match.clinicId = params.clinicId;
			match.status = { "$in": [TRANSACTION_STATUS.SUCCESS, TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.FAILED]};
			aggPipe.push({ "$match": match });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 }; // NOSONAR
			aggPipe.push({ "$sort": sort });

			aggPipe.push({
				$limit: LIMIT.TRANSACTION_LIMIT
			})

			aggPipe.push({
				"$project": {
					_id: 1, clinicId: 1, created: 1, transactionId: 1, amount: 1, status: 1, clinicName: 1
				}
			});

			const data = await this.aggregate(collection,aggPipe)
			return {data:data};
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getAllTransactionListing
	 * @description get the listing of all clinic transactions 
	 */
	async getAllTransactionListing(params: TransactionRequest.TransactionListing, tokenData: TokenData){
		try{
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			const aggPipe = []; //NOSONAR
			const match: any = {};

			match.status = { "$in": [TRANSACTION_STATUS.SUCCESS, TRANSACTION_STATUS.PENDING, TRANSACTION_STATUS.FAILED]};
			if(params.subscriptionType){
				match.subscriptionType = params.subscriptionType;
			}
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
					_id: 1, clinicId: 1, created: 1, transactionId: 1, amount: 1, status: 1, clinicName: 1
				}
			});

			let pageCount = true;
			if(!params.isExport){
				let result = await this.aggregateAndPaginate(collection, aggPipe, params.limit, params.pageNo, pageCount);
				const amount = await this.getPayments();
				return {...result, amount};
			}else{
				const subscription = await this.aggregate(collection,aggPipe)
				const formattedData = subscription.map(item => ({
                    ...item,
                    created: new Date(item.created).toLocaleDateString(),
					amount: `$${item.amount}`
                }));
				let date = Date.now();
				const data: { url: string } = {
					url: String(await this.exportToCSV(formattedData, `${tokenData.userId}_${date}__SubscriptionListing.csv`)),
				};
				return data;
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
				{ id: 'transactionId', title: 'Transaction ID' },
				{ id: 'created', title: 'Transaction Date' },
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
	 * @function getPayments
	 * @description get the sum of all success payments
	 * @returns sum of payments
	 */
	async getPayments(){
		try{
			const fromDate = moment().subtract(1, 'months').startOf('month').valueOf();
			const toDate = moment().subtract(1, 'months').endOf('month').valueOf();
			const fromDate1 = moment().startOf('month').valueOf();
			const toDate1 = moment().endOf('month').valueOf();
			const fromDate2 = moment().subtract(2, 'months').startOf('month').valueOf();
			const toDate2 = moment().subtract(2, 'months').endOf('month').valueOf();
			
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			const match: any = {};
			const match1: any = {};
			const match2: any = {};
			match.created = {"$gte": fromDate, "$lte": toDate};
			match.status = TRANSACTION_STATUS.SUCCESS;
			match1.created = {"$gte": fromDate1, "$lte": toDate1};
			match1.status = TRANSACTION_STATUS.SUCCESS;
			match2.created = {"$gte": fromDate2, "$lte": toDate2};
			match2.status = TRANSACTION_STATUS.SUCCESS;
			const aggPipe = [{ $match: match },
				{
					$group: {
						_id: null,
						totalAmount: { $sum: "$amount" }
					}
				}];
			const aggPipe1 = [{ $match: match1 },
				{
					$group: {
						_id: null,
						totalAmount: { $sum: "$amount" }
					}
				}];
			const aggPipe2 = [{ $match: match2 },
				{
					$group: {
						_id: null,
						totalAmount: { $sum: "$amount" }
					}
				}];
			
			const result = await this.aggregate(collection,aggPipe);
			const result1 = await this.aggregate(collection,aggPipe1);
			const result2 = await this.aggregate(collection,aggPipe2);
			const lastMonthAmount = result[0] ? result[0].totalAmount : 0;
			const currentMonthAmount = result1[0] ? result1[0].totalAmount : 0;
			const lastOfLastMonthAmount = result2[0] ? result2[0].totalAmount : 0;
			return {lastMonthAmount, currentMonthAmount, lastOfLastMonthAmount};
		}
		catch(error){
			throw error;
		}
	}

	/**
	 * @function getTotalAmount
	 * @description get the total amount of a month
	 */
	async getTotalAmount(params: TransactionRequest.Amount) {
		try {
			const collection = encryptedDb.getTransactionHistoryEncryptedClient();
			const match: any = {
				status: TRANSACTION_STATUS.SUCCESS
			};

			const aggPipe = []
			aggPipe.push({ $match: match });

			if (params.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
				aggPipe.push(
					{
						$group: {
							_id: {
								year: { $year: { $toDate: "$created" } },
								month: { $month: { $toDate: "$created" } }
							},
							totalAmount: { $sum: "$amount" }
						}
					},
					{
						$sort: {
							"_id.year": -1,
							"_id.month": -1
						}
					}
				);
			}
			else {
				aggPipe.push(
					{
						$group: {
							_id: {
								year: { $year: { $toDate: "$created" } }
							},
							totalAmount: { $sum: "$amount" }
						}
					},
					{
						$sort: {
							"_id.year": -1
						}
					}
				);
			}

			const result = await this.aggregate(collection, aggPipe);
			const monthlyTotals = result.map(item => ({
				month: monthNames[item._id.month - 1],
				year: item._id.year,
				totalAmount: item.totalAmount
			}));
			return { data: monthlyTotals };
		}
		catch(error){
			throw error;
		}
	}
}

export const transactionDao = new TransactionDao();
