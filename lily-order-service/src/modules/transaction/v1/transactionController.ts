"use strict";
import {
  encryptData,
} from "@utils/appUtils";
import {
  USER_TYPE,
} from "@config/index";
import * as transactionConstant from "@modules/transaction/v1/transactionConstant";
import { transactionDaoV1 } from "..";

export class TransactionController {
    
    /**
     * @function addSubscription
     * @description clinic can purchase subscription
     * @params payload contains encrypted data : decrypted params defined below
     * @returns 
     */
    async addTransaction(params: TransactionRequest.addTransaction) {
        try {
            await transactionDaoV1.addTransaction(params);
            return transactionConstant.MESSAGES.SUCCESS.TRANSACTION_ADDED;
        }
        catch (error) {
            throw error;
        }
    }

    /**
     * @function getTransactionListing
     * @description get the listing of transaction of a clinic
     * @param params.clinicId clinic id(required)
     * @returns array of trasactions
     */
    async getTransactionListing(params: TransactionRequest.TransactionListing, tokenData: TokenData){
        try{
            const isClinicExists = await transactionDaoV1.isClinicExists(params.clinicId);
            if(!isClinicExists)return Promise.reject(transactionConstant.MESSAGES.ERROR.CLINIC_NOT_FOUND);

            let data = await transactionDaoV1.getTransactionListing(params);
            data = encryptData(JSON.stringify(data));
            return transactionConstant.MESSAGES.SUCCESS.TRANSACTION_LISTING(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getAllTransactionListing
     * @description get the listing of all clinic transactions
     * @param params.pageNo page no (required)
     * @param params.limit limit (required)
     * @returns array of transactions
     */
    async getAllTransactionListing(params: TransactionRequest.TransactionListing, tokenData: TokenData){
        try{
            let data = await transactionDaoV1.getAllTransactionListing(params, tokenData);
            data = encryptData(JSON.stringify(data));
            return transactionConstant.MESSAGES.SUCCESS.TRANSACTION_LISTING(data);
        }
        catch(error){
            throw error;
        }
    }

    /**
     * @function getPaymentsAmount
     * @description get the sum of last and current month transaction amount 
     * @returns object of amount
     */
    async getPaymentsAmount(tokenData: TokenData){
        try{
            if(tokenData.userType !== USER_TYPE.ADMIN)
                return Promise.reject(transactionConstant.MESSAGES.ERROR.INVALID_ADMIN);

            let data = await transactionDaoV1.getPayments();
            return transactionConstant.MESSAGES.SUCCESS.AMOUNT_DATA(data);
        }
        catch(error){
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
    async getTotalAmount(params: TransactionRequest.Amount, tokenData: TokenData){
        try{
            if(tokenData.userType !== USER_TYPE.ADMIN)
                return Promise.reject(transactionConstant.MESSAGES.ERROR.INVALID_ADMIN);

            let data = await transactionDaoV1.getTotalAmount(params);
            data = encryptData(JSON.stringify(data));
            return transactionConstant.MESSAGES.SUCCESS.AMOUNT_DATA(data);
        }
        catch(error){
            throw error;
        }
    }
}

export const transactionController = new TransactionController();
