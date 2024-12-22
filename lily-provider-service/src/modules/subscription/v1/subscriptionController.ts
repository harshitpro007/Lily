"use strict";
import {
  decryptData,
  encryptData,
  toObjectId,
} from "@utils/appUtils";
import {
  STATUS,
  MESSAGES,
  USER_TYPE,
  SERVER,
  DAYS_CONST,
} from "@config/index";
import * as subscriptionConstant from "@modules/subscription/v1/subscriptionConstant";
import { addSubscription, editSubscriptionDetails } from "./routeValidator";
import { subscriptionDaoV1 } from "..";
import { encryptedDb } from "@utils/DatabaseClient";
import { axiosService } from "@lib/axiosService";
import moment from "moment";
import { providerDaoV1 } from "@modules/provider";
import { DASHBOARD_TYPE, SUBSCRIPTION_TYPE } from "@modules/provider/v1/providerConstant";

export class SubscriptionController {
    
    /**
     * @function addSubscription
     * @description clinic can purchase subscription
     * @params payload contains encrypted data : decrypted params defined below
     * @returns 
     */
    async addSubscription(payload: SubscriptionRequest.Payload, tokenData: TokenData, accessToken: string) {
        try {
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: SubscriptionRequest.addSubscription = JSON.parse(decryptedData);
            const validation = addSubscription.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }

            let data = await axiosService.post({ "url": SERVER.ORDER_APP_URL + SERVER.ADD_SUBSCRIPTION, "body": payload, "auth": accessToken });
            data = encryptData(JSON.stringify(data.data));
            return subscriptionConstant.MESSAGES.SUCCESS.SUBCRIPTION_PURCHASED(data);
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * @function getSubscriptionDetails
     * @description get the details of clinic subscription by clinic id
     * @param params.clinicId clinic id(required)
     * @returns object of clinic details
     */
    async getSubscriptionDetails(params: SubscriptionRequest.SubscriptionDetails, tokenData: TokenData){
        try{
            const isClinicExists = await subscriptionDaoV1.isClinicExists(params.clinicId);
            if(!isClinicExists)return Promise.reject(subscriptionConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

            const providerColl = encryptedDb.getProviderEncryptedClient();
            if(tokenData.userType !== USER_TYPE.ADMIN){
                const step1 = await subscriptionDaoV1.findOne(providerColl, {_id: toObjectId(tokenData.userId), clinicId: params.clinicId, createdBy: USER_TYPE.ADMIN});
                if (!step1) return Promise.reject(subscriptionConstant.MESSAGES.ERROR.INVALID_PROVIDER);
                if (step1.status === STATUS.INACTIVE)
                    return Promise.reject(subscriptionConstant.MESSAGES.ERROR.BLOCKED);
            }

            let result = await subscriptionDaoV1.getSubscriptionDetails(params,tokenData);
            result = encryptData(JSON.stringify(result));
            return MESSAGES.SUCCESS.DETAILS(result);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getSubscriptionListing
     * @description get the listing of clinic subscriptions
     * @param params.pageNo page no (required)
     * @param params.limit limit (required)
     * @returns array of subscriptions
     */
    async getSubscriptionListing(params: SubscriptionRequest.SubscriptionListing, tokenData: TokenData, accessToken: string){
        try{
            const subsCollection = encryptedDb.getsubscriptionEncryptedClient();
            const result = await subscriptionDaoV1.getSubscriptionListing(params,tokenData)
            let amount = await axiosService.getData({ "url": SERVER.ORDER_APP_URL + SERVER.GET_AMOUNT, "auth": accessToken })
            const newSubs = await subscriptionDaoV1.countDocuments(
                subsCollection, 
                {created: {"$gte": moment().startOf('month').valueOf()}, status: subscriptionConstant.SUBSCRIPTION_STATUS.ACTIVE}
            );
            const prevMonthSubs = await subscriptionDaoV1.countDocuments(
                subsCollection, 
                {created: {"$gte": moment().subtract(DAYS_CONST.ONE, 'months').startOf('month').valueOf(), "$lte": moment().subtract(DAYS_CONST.ONE, 'months').endOf('month').valueOf()}, status: subscriptionConstant.SUBSCRIPTION_STATUS.ACTIVE}
            );
            amount = amount.data; 
            amount.newSubscribers = newSubs;
            amount.prevMonthSubs = prevMonthSubs;
            let data = {...result, amount}
            data = encryptData(JSON.stringify(data));
            return subscriptionConstant.MESSAGES.SUCCESS.DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function editSubscriptionDetails
     * @description edit the details of subscription
     * @payload payload contains encrypted data : decrypted params defined below
     * @param params.clinicId clinic id(required)
     * @param params.subscriptionDetails subscription details(required)
     * @returns updated subscription details object
     */
    async editSubscriptionDetails(payload: SubscriptionRequest.Payload, tokenData: TokenData){
        try{
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
            let params: SubscriptionRequest.EditSubscriptionDetails  = JSON.parse(decryptedData);
            const validation = editSubscriptionDetails.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
            }

            const isClinicExists = await subscriptionDaoV1.isClinicExists(params.clinicId);
            if(!isClinicExists)return Promise.reject(subscriptionConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

            if (isClinicExists.status === STATUS.INACTIVE)
                return Promise.reject(subscriptionConstant.MESSAGES.ERROR.BLOCKED);

            let result = await subscriptionDaoV1.editSubscriptionDetails(params);
            result = encryptData(JSON.stringify(result));
            return subscriptionConstant.MESSAGES.SUCCESS.DETAILS(result);
        }
        catch(error){
            throw error;
        }
    }

    async susbcriptionStatus() {
        try {
            console.log(`subscription status cron invoked`);
            const collection = encryptedDb.getProviderEncryptedClient();
            const subscriptionColl = encryptedDb.getsubscriptionEncryptedClient();
            const timestamp= Date.now();
            await providerDaoV1.updateMany(collection,{isSubscribed:true,subscriptionEndDate:{$lte:timestamp}},{isSubscribed:false});
            const monthlyExpireCount = await providerDaoV1.countDocuments(subscriptionColl, {subscriptionEndDate:{$lte:timestamp}, subscriptionType: SUBSCRIPTION_TYPE.MONTHLY});
            const annualExpireCount = await providerDaoV1.countDocuments(subscriptionColl, {subscriptionEndDate:{$lte:timestamp}, subscriptionType: SUBSCRIPTION_TYPE.ANNUAL});
            await providerDaoV1.updateMany(subscriptionColl,{subscriptionEndDate:{$lte:timestamp}},{status:STATUS.INACTIVE});
            let dashboard = {
                type: DASHBOARD_TYPE.SUBSCRIPTION_COUNT,
                monthlyExpireCount: monthlyExpireCount,
                annualExpireCount: annualExpireCount
              }
            dashboard = encryptData(JSON.stringify(dashboard));
            await this.dashboard(dashboard);

            console.log(`subscription status cron finished job`);
        }catch(error) {
            throw error;
        }
    }

    async dashboard(params) {
        try {
            setTimeout(async () => {
                axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": { data: params } });
            }, 500);
        }
        catch (error) {
            throw error;
        }
    }

    async handler(payload: SubscriptionRequest.transactionId) {
        try {
            const transactionId: any = payload.transactionId;
            let transaction = await subscriptionDaoV1.findTransactionById({
                transactionId: transactionId
            });
            if(transaction) {
                console.log('transaction', transaction)
                transaction = encryptData(JSON.stringify(transaction));
                return MESSAGES.SUCCESS.DETAILS(transaction);
            } else {
                return MESSAGES.ERROR.TOKEN_NOT_FOUND
            }
           
        } catch (error) {
            throw error;
        }
    }
}

export const subscriptionController = new SubscriptionController();
