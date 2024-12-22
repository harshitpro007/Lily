"use strict";

import { SERVER } from "@config/environment";
import { MESSAGES } from "@config/main.constant";
import { axiosService } from "@lib/axiosService";
import * as subscriptionConstant from "@modules/subscription/v1/subscriptionConstant";
import { decryptData } from "@utils/appUtils";
import { editSubscriptionDetails } from "./routeValidator";


export class SubscriptionController {

    /**
     * @function getSubscriptions
     * @description get the listing of clinic subscriptions
     * @param params.pageNo page no (required)
     * @param params.limit limit (required)
     * @returns 
     */
    async getSubscriptions(params: SubscriptionRequest.SubscriptionListing, accessToken: string) {
        try {
            const data = await axiosService.getData({ "url": SERVER.PROVIDER_APP_URL + SERVER.GET_SUBSCRIPTION, "payload": params, auth: accessToken });
            return subscriptionConstant.MESSAGES.SUCCESS.SUBSCRIPTION_LISTING(data);
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * @function getSubscriptionDetails
     * @description get the details of clinic subscription using clinic id 
     * @param params.clinicId clinic Id(required)
     * @returns object of subscription details
     */
    async getSubscriptionDetails(params: SubscriptionRequest.SubscriptionDetails, accessToken: string){
        try{
            const data = await axiosService.getData({ "url": SERVER.PROVIDER_APP_URL + SERVER.SUBSCRIPTION_DETAILS, "payload": params, auth: accessToken });
            return subscriptionConstant.MESSAGES.SUCCESS.SUBSCRIPTION_DETAILS(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getTransactionListing
     * @description get the listing of clinic transactions using clinic id 
     * @param params.clinicId clinic Id(required)
     * @returns array of transactions
     */
    async getTransactionListing(params: SubscriptionRequest.TransactionListing, accessToken: string){
        try{
            const data = await axiosService.getData({ "url": SERVER.ORDER_APP_URL + SERVER.TRANSACTIONS, "payload": params, auth: accessToken });
            return subscriptionConstant.MESSAGES.SUCCESS.TRANSACTION_LISTING(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getAllTransactionListing
     * @description get the transactions of all clinic
     * @param params.pageNo page no (required)
     * @param params.limit limit (required)
     * @returns array of transactions
     */
    async getAllTransactionListing(params: SubscriptionRequest.TransactionListing, accessToken: string){
        try{
            const data = await axiosService.getData({ "url": SERVER.ORDER_APP_URL + SERVER.ALL_TRANSACTIONS, "payload": params, auth: accessToken });
            return subscriptionConstant.MESSAGES.SUCCESS.TRANSACTION_LISTING(data);
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
    async editSubscriptionDetails(payload: SubscriptionRequest.Payload, accessToken: string) {
        try {
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR); //NOSONAR
            let params: SubscriptionRequest.EditSubscriptionDetails  = JSON.parse(decryptedData);
            const validation = editSubscriptionDetails.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message)); //NOSONAR
            }

            const data = await axiosService.patchData({ "url": SERVER.PROVIDER_APP_URL + SERVER.SUBSCRIPTION, "body": payload, auth: accessToken });
            return subscriptionConstant.MESSAGES.SUCCESS.TRANSACTION_LISTING(data);
        }
        catch (error) {
            throw error;
        }
    }

     /**
     * @function getTotalAmount
     * @description get the total amount of a month
     * @param params.fromDate from date (required)
     * @param params.toDate to Date (required)
     * @returns object of amount
     */
    async getAmount(params: SubscriptionRequest.Amount, accessToken: string){
        try{
            const data = await axiosService.getData({ "url": SERVER.ORDER_APP_URL + SERVER.AMOUNT_LOG, "payload": params, auth: accessToken });
            return subscriptionConstant.MESSAGES.SUCCESS.DETAILS(data.data);
        }
        catch(error){
            throw error;
        }
    }
}

export const subscriptionController = new SubscriptionController();
