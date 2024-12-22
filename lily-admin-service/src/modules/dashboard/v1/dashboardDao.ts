import { STATUS, USER_TYPE } from "@config/main.constant";
import { DASHBOARD_TYPE, MESSAGES, SUBSCRIPTION_TYPE } from "@modules/admin/v1/adminConstant";
import { BaseDao } from "@modules/baseDao";
import { encryptionBaseDao } from "@modules/baseDao/EncryptedClientBaseDao";
import { encryptedDb } from "@utils/DatabaseClient";
import moment from "moment";

export class DashboardDao extends BaseDao {
	/**
	  * @function createDashbaord
	  * @description create dashboard stats
	  */
	async createDashbaord(params: any) {
		try {
			return await this.save("dashboard", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function isDashbaordExist
	 * @description check is dashboard exists or not
	 */
	async isDashbaordExist() {
		try {
			return await this.findOne("dashboard", {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateDashboardData
	 * @description update the data of dashboard
	 */
	async updateDashboardData(params: DashboardRequest.updateDashboard, dashboard: any) {
		try {
			const currentYear = new Date().getFullYear();
			switch (params.type) {
				case DASHBOARD_TYPE.CLINIC:
					await Promise.all([
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalUsers: 1 } }),
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalClinics: 1 } })
					])
					break;
				case DASHBOARD_TYPE.PATIENT:
					await Promise.all([
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalUsers: 1 } }),
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalPatient: 1 } })
					])
					break;
				case DASHBOARD_TYPE.PROVIDER:
					await Promise.all([
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalUsers: 1 } }),
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalProviders: 1 } })
					])
					break;
				case DASHBOARD_TYPE.SUBSCRIPTION_COUNT: {
					const total = params.monthlyExpireCount + params.annualExpireCount;
					await Promise.all([
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalMonthlySubscriptions: -params.monthlyExpireCount} }),
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalMonthlySubscriptions: -params.annualExpireCount} }),
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalSubscriptions: -params.annualExpireCount} }),
					])
					break;
				}
				case DASHBOARD_TYPE.SUBSCRIPTION:
					await Promise.all([
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalSubscriptions: 1 } }),
						this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalPayements: params.amount } }),
						this.findOneAndUpdate(
							"dashboard",
							{ _id: dashboard._id, "payments.year": currentYear },
							{ $inc: { "payments.$.amount": params.amount } }
						).then(result => {
							if (!result) {
								return this.findOneAndUpdate(
									"dashboard",
									{ _id: dashboard._id, "payments.year": { $ne: currentYear } },
									{ $push: { payments: { year: currentYear, amount: params.amount } } }
								);
							}
						})
					]);
					if (params.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY) {
						await this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalMonthlySubscriptions: 1 } });
					}
					else {
						await this.findOneAndUpdate("dashboard", { _id: dashboard._id }, { $inc: { totalAnnualSubscriptions: 1 } });
					}
					break;
				default:
					return Promise.reject(MESSAGES.ERROR.INVALID_CASE);
			}
			return true;
		}
		catch (error) {
			throw error;
		}
	}

	/**
     * @function dashboard
     * @description get the data of dashboard
     */
	async dashboard(){
		try {
			const transactionColl = encryptedDb.getTransactionHistoryEncryptedClient();
			const providerColl = encryptedDb.getProviderEncryptedClient();
			const patientColl = encryptedDb.getPatientEncryptedClient();
			const subscriptionColl = encryptedDb.getsubscriptionEncryptedClient();
			const startOfWeek = moment().startOf('week').valueOf();
			const endOfWeek = moment().endOf('week').valueOf();
			const startOfMonth = moment().startOf('month').valueOf();
			const endOfMonth = moment().endOf('month').valueOf();
			const startOfYear = moment().startOf('year').valueOf();
			const endOfYear = moment().endOf('year').valueOf();
			const weekTotalAmount = await encryptionBaseDao.aggregate(transactionColl, [
				{
					$match: { created: { $gte: startOfWeek, $lte: endOfWeek }, status: STATUS.SUCCESS }
				},
				{
					$group: { _id: null, total: { $sum: '$amount' } }
				},
				{
					$project: {_id: 0, total: 1 }
				}
			]);

			const monthTotalAmount = await encryptionBaseDao.aggregate(transactionColl, [
				{
					$match: { created: { $gte: startOfMonth, $lte: endOfMonth },  status: STATUS.SUCCESS }
				},
				{
					$group: { _id: null, total: { $sum: '$amount' } }
				},
				{
					$project: {_id: 0, total: 1 }
				}
			]);
			const yearTotalamount = await encryptionBaseDao.aggregate(transactionColl, [
				{
					$match: { created: { $gte: startOfYear, $lte: endOfYear },  status: STATUS.SUCCESS }
				},
				{
					$group: { _id: null, total: { $sum: '$amount' } }
				},
				{
					$project: {_id: 0, total: 1 }
				}
			]);

			const [activeProviders,inactiveProviders, activePatient, inactivePatient, activeSubscription, inactiveSubscription, monthlyActivePatients, monthlyActiveClinics, monthlyActiveProviders] = await Promise.all([
				encryptionBaseDao.countDocuments(providerColl, {status: {$in: [STATUS.ACTIVE,STATUS.PENDING]}}),
				encryptionBaseDao.countDocuments(providerColl, {status: STATUS.INACTIVE}),
				encryptionBaseDao.countDocuments(patientColl, {status: STATUS.ACTIVE}),
				encryptionBaseDao.countDocuments(patientColl, {status: {$in: [STATUS.INACTIVE,STATUS.PENDING]}}),
				encryptionBaseDao.countDocuments(subscriptionColl, {status: STATUS.ACTIVE}),
				encryptionBaseDao.countDocuments(subscriptionColl, {status: STATUS.INACTIVE}),
				encryptionBaseDao.countDocuments(patientColl, {status: STATUS.ACTIVE}),
				encryptionBaseDao.countDocuments(providerColl, {status: STATUS.ACTIVE, createdBy: USER_TYPE.ADMIN}),
				encryptionBaseDao.countDocuments(providerColl, {status: STATUS.ACTIVE, createdBy: USER_TYPE.PROVIDER}),
			])

			let data = await this.findOne("dashboard", {}, {_id: 0, createdAt: 0, updatedAt: 0, totalCurrentMonthPayements: 0, totalCurrentWeekPayements: 0, totalCurrentYearPayements: 0, status: 0, created: 0});

			data.activeUsers = activeProviders + activePatient;
			data.inactiveUsers = inactiveProviders + inactivePatient;
			data.activeSubscription = activeSubscription;
			data.inactiveSubscription = inactiveSubscription;
			data.weekTotalAmount = weekTotalAmount[0]?.total ? weekTotalAmount[0]?.total : 0;
			data.monthTotalAmount = monthTotalAmount[0]?.total ? monthTotalAmount[0]?.total: 0;
			data.yearTotalamount = yearTotalamount[0]?.total ? yearTotalamount[0]?.total : 0;
			data.monthlyActivePatients = monthlyActivePatients;
			data.monthlyActiveClinics = monthlyActiveClinics;
			data.monthlyActiveProviders = monthlyActiveProviders;
			return data;
		}
		catch(error){
			throw error;
		}
	}
}

export const dashboardDao = new DashboardDao();