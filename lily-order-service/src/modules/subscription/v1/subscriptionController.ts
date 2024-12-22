"use strict";
import {
  decryptData,
  encryptData,
  toObjectId,
} from "@utils/appUtils";
import {
    DEVICE_TYPE,
  MESSAGES,
  NUMERIC_CONST,
  SERVER,
  STATUS,
  USER_TYPE,
} from "@config/index";
import { encryptedDb } from "@utils/DatabaseClient";
import * as subscriptionConstant from "@modules/subscription/v1/subscriptionConstant";
import { subscriptionDaoV1 } from "..";
import { transactionControllerV1, transactionDaoV1 } from "@modules/transaction";
import { addSubscription } from "./routeValidator";
import { stripe } from "@lib/stripe";
import { DASHBOARD_TYPE, MAIL_TYPE, NOTIFICATION_TYPE, PAYMENT_STATUS, RESPONSE_ID, STRIPE_WEBHOOKS, SUBSCRIPTION_INTERVAL, SUBSCRIPTION_TYPE } from "@modules/subscription/v1/subscriptionConstant";
import { randomInt } from "crypto";
import { axiosService } from "@lib/axiosService";
import moment from "moment";
export class SubscriptionController {
    /**
     * @function addSubscription
     * @description clinic can purchase subscription
     * @params payload contains encrypted data : decrypted params defined below
     * @returns 
     */
    async addSubscription(payload: SubscriptionRequest.Payload, tokenData: TokenData) {
        try {
            const userId= tokenData.userId;
            const providerColl = encryptedDb.getProviderEncryptedClient();
            let decryptedData = decryptData(payload.data);
            if (!decryptedData) return Promise.reject(MESSAGES.ERROR.DECRYPTION_ERROR);
            let params: SubscriptionRequest.addSubscription = JSON.parse(decryptedData);
            const validation = addSubscription.validate(params);
            if (validation.error) {
                return Promise.reject(MESSAGES.ERROR.PAYLOAD_ERROR(validation.error.details[0].message));
            }
            const step1 = await subscriptionDaoV1.findOne(providerColl, {_id: toObjectId(userId), clinicId: params.clinicId, status: STATUS.ACTIVE});
            if(!step1 || step1?.isMainProvider == false){
                return Promise.reject(subscriptionConstant.MESSAGES.ERROR.INVALID_PROVIDER);
            }
            if (step1.status === STATUS.INACTIVE) return Promise.reject(subscriptionConstant.MESSAGES.ERROR.BLOCKED);
            
            params.userId = toObjectId(userId);
            let stripeCustomerId: string;
            const transactionId = randomInt(10**4, 10**5-1).toString();
            console.log('transactionId purchase',transactionId)
            const isSubscription = await subscriptionDaoV1.findOne(providerColl, {_id: params.userId, stripeCustomerId: {$exists: true}});
            if(!isSubscription){
                const savedStripeCustomer = await this.createCustomer({ email: step1.email, name: step1.adminName });
                await subscriptionDaoV1.findOneAndUpdate(providerColl, {_id: params.userId}, {transactionId:transactionId,stripeCustomerId: savedStripeCustomer?.id,});
                stripeCustomerId = savedStripeCustomer?.id;
            }
            else{
                stripeCustomerId = isSubscription?.stripeCustomerId;
                await subscriptionDaoV1.findOneAndUpdate(providerColl, {_id: params.userId}, {transactionId:transactionId});
            }
            let interval;
            if(step1.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY){
                interval = SUBSCRIPTION_INTERVAL.MONTH;
            }
            else{
                interval = SUBSCRIPTION_INTERVAL.YEAR;
            }
            console.log("stripe url #######", SERVER.PROVIDER_CREDENTIALS.URL+SERVER.STRIPE_SUCCESS_URL+RESPONSE_ID.SUCCESS + `&transactionId=${transactionId}`)
            const session = await stripe.checkSessionCreation({
                payment_method_types: [subscriptionConstant.PAYMENT_MODE_TYPES.CARD, subscriptionConstant.PAYMENT_MODE_TYPES.ACH_DEBIT],
                payment_method_options: {
                    us_bank_account: {
                      verification_method: subscriptionConstant.ACH_DEBIT_CONFIG.INSTANT,
                      financial_connections: {
                        permissions: [subscriptionConstant.ACH_DEBIT_CONFIG.PAYMENT_METHOD],
                      },
                    },
                },
                line_items: [{
                    price_data: {
                        currency: subscriptionConstant.CURRENCY.USD,
                        product_data: {
                            name: step1.clinicName,
                        },
                        unit_amount: step1.subscriptionCharges * 100, 
                        recurring: {
                            interval: interval, 
                        },
                    },
                    quantity: 1,
                }],
                mode: subscriptionConstant.MODE.SUBSCRIPTION,
                customer: stripeCustomerId,
                metadata: {
                    email: step1.email,
                    planId: step1.subscriptionType,
                    userId: userId,
                    clinicId: step1.clinicId,
                    stripeCustomerId: stripeCustomerId,
                    clinicName: step1.clinicName,
                    transactionId: transactionId
                },
                success_url: SERVER.PROVIDER_CREDENTIALS.URL+SERVER.STRIPE_SUCCESS_URL+RESPONSE_ID.SUCCESS + `&transactionId=${transactionId}`,
                cancel_url: SERVER.PROVIDER_CREDENTIALS.URL+ SERVER.STRIPE_CANCEL_URL+RESPONSE_ID.FAILED + `&transactionId=${transactionId}`,
            })
            return {
                gatewayUrl: session.url
            };
        }
        catch (error) {
            throw error;
        }
    }

    async createCustomer(params: { email: string, name: string }) {
        return await stripe.createCustomer({
            email: params.email,
            name: params.name
        });
    }

    async webhook(event: any) {
        try {
            switch (event.type) {
                case STRIPE_WEBHOOKS.SUCCESS: {
                    const providerColl = encryptedDb.getProviderEncryptedClient();
                    const eventData = event.data.object;
                    let invoiceId = eventData.invoice;
                    let subscriptionEndDate:number; 
                    if(eventData.metadata.planId === SUBSCRIPTION_TYPE.MONTHLY){
                        subscriptionEndDate = moment().add(NUMERIC_CONST.ONE, 'month').valueOf();
                    }
                    else{
                        subscriptionEndDate = moment().add(NUMERIC_CONST.ONE, 'year').valueOf();
                    }
                    let result;
                    const provider = await subscriptionDaoV1.findOne(
                        providerColl, 
                        {_id: toObjectId(eventData.metadata.userId), clinicId: eventData.metadata.clinicId, userType: USER_TYPE.PROVIDER}
                    );
                    if(!provider) {
                        return MESSAGES.ERROR.UNAUTHORIZED_ACCESS;
                    }
                    if(eventData.payment_status === PAYMENT_STATUS.PAID){

                        let params:SubscriptionRequest.addSubscription = {
                            subscriptionType: eventData.metadata.planId,
                            email: eventData.metadata.email,
                            userId: toObjectId(eventData.metadata.userId),
                            amount: eventData.amount_total / 100,
                            status: STATUS.ACTIVE,
                            stripeCustomerId: eventData.metadata.stripeCustomerId,
                            subscriptionEndDate: subscriptionEndDate,
                            subscriptionStartDate: Date.now(),
                            clinicName: eventData.metadata.clinicName,
                            clinicId: eventData.metadata.clinicId,
                            invoiceId: invoiceId,
                            created: Date.now()
                        }
                        // saving data in subscription model
                        result = await subscriptionDaoV1.addSubscription(params);
                        const step1 =await subscriptionDaoV1.findOneAndUpdate(
                            providerColl, 
                            {_id: toObjectId(params.userId), clinicId: params.clinicId, userType: USER_TYPE.PROVIDER}, 
                            {isSubscribed: true, subscriptionStartDate: params.subscriptionStartDate, subscriptionEndDate: params.subscriptionEndDate, }
                        );
                        await subscriptionDaoV1.updateMany(
                            providerColl, 
                            {clinicId: params.clinicId}, 
                            {isSubscribed: true, subscriptionStartDate: params.subscriptionStartDate, subscriptionEndDate: params.subscriptionEndDate}
                        );
                        //saving data in the transacttion model
                        let data:any = {
                            userId: toObjectId(eventData.metadata.userId),
                            transactionId: eventData.metadata.transactionId,
                            amount: eventData.amount_total / 100,
                            originalTransactionId: invoiceId,
                            clinicName: eventData.metadata.clinicName,
                            clinicId: eventData.metadata.clinicId,
                            status: STATUS.SUCCESS
                        }
                        await transactionControllerV1.addTransaction(data);
                        let dashboard = {
                            type: DASHBOARD_TYPE.SUBSCRIPTION,
                            amount: eventData.amount_total / 100,
                            subscriptionType: eventData.metadata.planId,
                        }
                        dashboard = encryptData(JSON.stringify(dashboard));
                        axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": { data: dashboard } });
                        let mailData = {
                            type: MAIL_TYPE.SUBSCRIPTION,
                            amount: step1.subscriptionCharges,
                            clinic_name: step1.clinicName,
                            duration: step1.subscriptionType,
                            contract: step1.contract,
                            email: eventData.metadata.email
                        }
                        mailData = encryptData(JSON.stringify(mailData));
                        axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData } });
                        let notificationData = {
                            type: NOTIFICATION_TYPE.PURCHASE_SUBSCRIPTION,
                            userId: [eventData.metadata.userId],
                            platform: DEVICE_TYPE.WEB
                        }
                        notificationData = encryptData(JSON.stringify(notificationData));
                        await this.inAppNotification(notificationData);
                    }
                    else {

                        let data:any = {
                            userId: toObjectId(eventData.metadata.userId),
                            transactionId: eventData.metadata.transactionId,
                            amount: eventData.amount_total / 100,
                            originalTransactionId: invoiceId,
                            clinicName: eventData.metadata.clinicName,
                            clinicId: eventData.metadata.clinicId,
                            status: STATUS.PENDING
                        }
                        await transactionControllerV1.addTransaction(data);
                    }
                    return MESSAGES.SUCCESS.DETAILS(result);
                }
                case STRIPE_WEBHOOKS.FAILED: {
                    const providerColl = encryptedDb.getProviderEncryptedClient();
                    const failedSession = event.data.object;
                    const provider = await subscriptionDaoV1.findOne(
                        providerColl, 
                        {_id: toObjectId(failedSession.metadata.userId), clinicId: failedSession.metadata.clinicId, userType: USER_TYPE.PROVIDER}
                    );
                    if(!provider) {
                        return MESSAGES.ERROR.UNAUTHORIZED_ACCESS;
                    }

                    let invoiceId = failedSession.invoice;
                    const params:any = {
                        userId: toObjectId(failedSession.metadata.userId),
                        transactionId: failedSession.metadata.transactionId,
                        amount: failedSession.amount_total / 100,
                        originalTransactionId: invoiceId,
                        clinicName: failedSession.metadata.clinicName,
                        clinicId: failedSession.metadata.clinicId,
                        status: STATUS.FAILED
                    }
                    // saving data in transaction model
                    const result = await transactionControllerV1.addTransaction(params);
                    return MESSAGES.SUCCESS.DETAILS(result);
                }
                // case STRIPE_WEBHOOKS.ACH_COMPLETED: {

                //     const providerColl = encryptedDb.getProviderEncryptedClient();
                //     const eventData = event.data.object;
                //     let invoiceId = eventData.invoice;
                //     let subscriptionEndDate:number; 
                //     if(eventData.metadata.planId === SUBSCRIPTION_TYPE.MONTHLY){
                //         subscriptionEndDate = moment().add(NUMERIC_CONST.ONE, 'month').valueOf();
                //     }
                //     else{
                //         subscriptionEndDate = moment().add(NUMERIC_CONST.ONE, 'year').valueOf();
                //     }
                //     let result;
                //     if(eventData.payment_status === PAYMENT_STATUS.PAID){
                //         let params:SubscriptionRequest.addSubscription = {
                //             subscriptionType: eventData.metadata.planId,
                //             email: eventData.metadata.email,
                //             userId: toObjectId(eventData.metadata.userId),
                //             amount: eventData.amount_total / 100,
                //             status: STATUS.ACTIVE,
                //             stripeCustomerId: eventData.metadata.stripeCustomerId,
                //             subscriptionEndDate: subscriptionEndDate,
                //             subscriptionStartDate: Date.now(),
                //             clinicName: eventData.metadata.clinicName,
                //             clinicId: eventData.metadata.clinicId,
                //             invoiceId: invoiceId,
                //             created: Date.now()
                //         }
                //         // saving data in subscription model
                //         result = await subscriptionDaoV1.addSubscription(params);
                //         const step1 =await subscriptionDaoV1.findOneAndUpdate(
                //             providerColl, 
                //             {_id: toObjectId(params.userId), clinicId: params.clinicId, userType: USER_TYPE.PROVIDER}, 
                //             {isSubscribed: true, subscriptionStartDate: params.subscriptionStartDate, subscriptionEndDate: params.subscriptionEndDate}
                //         );
                //         await subscriptionDaoV1.updateMany(
                //             providerColl, 
                //             {clinicId: params.clinicId}, 
                //             {isSubscribed: true, subscriptionStartDate: params.subscriptionStartDate, subscriptionEndDate: params.subscriptionEndDate}
                //         );
                //         //saving data in the transacttion model
                //         const transactionId: any = eventData.metadata.transactionId;
                //         let transaction = await transactionDaoV1.findTransactionById({
                //             transactionId: transactionId
                //         });
                //         if(!transaction) {
                //             let data:any = {
                //                 userId: toObjectId(eventData.metadata.userId),
                //                 transactionId: eventData.metadata.transactionId,
                //                 amount: eventData.amount_total / 100,
                //                 originalTransactionId: invoiceId,
                //                 clinicName: eventData.metadata.clinicName,
                //                 clinicId: eventData.metadata.clinicId,
                //                 status: STATUS.SUCCESS
                //             }
                //             await transactionControllerV1.addTransaction(data);
                //         }else {
                //             await transactionDaoV1.updateTransactionById({
                //                 transactionId: transactionId
                //             }, {
                //                 status:STATUS.SUCCESS
                //             })
                //         }
                       
                //         let dashboard = {
                //             type: DASHBOARD_TYPE.SUBSCRIPTION,
                //             amount: eventData.amount_total / 100,
                //             subscriptionType: eventData.metadata.planId,
                //         }
                //         dashboard = encryptData(JSON.stringify(dashboard));
                //         axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": { data: dashboard } });
                //         let mailData = {
                //             type: MAIL_TYPE.SUBSCRIPTION,
                //             amount: step1.subscriptionCharges,
                //             clinic_name: step1.clinicName,
                //             duration: step1.subscriptionType,
                //             contract: step1.contract,
                //             email: eventData.metadata.email
                //         }
                //         mailData = encryptData(JSON.stringify(mailData));
                //         axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData } });
                //     }else {
                //         let data:any = {
                //             userId: toObjectId(eventData.metadata.userId),
                //             transactionId: eventData.metadata.transactionId,
                //             amount: eventData.amount_total / 100,
                //             originalTransactionId: invoiceId,
                //             clinicName: eventData.metadata.clinicName,
                //             clinicId: eventData.metadata.clinicId,
                //             status: STATUS.FAILED
                //         }
                //         await transactionControllerV1.addTransaction(data);
                //     }
                //     return MESSAGES.SUCCESS.DETAILS(result);

                // }

                case STRIPE_WEBHOOKS.CHARGE_SUCCEEDED: {

                    const providerColl = encryptedDb.getProviderEncryptedClient();
                    const eventData = event.data.object;
                    let invoiceId = eventData.invoice;
                    let subscriptionEndDate:number; 
                    const stripeCustomerId= eventData.customer;
                    const paymentMethodId= eventData.payment_method;
                    console.log('stripeCustomerId',stripeCustomerId);
                    const provider:any =await subscriptionDaoV1.findOne(
                        providerColl, 
                        {stripeCustomerId: stripeCustomerId}, 
                    );
                    if(!provider) {
                        return MESSAGES.ERROR.UNAUTHORIZED_ACCESS;
                    }
                    const payment_method_details= await stripe.getpaymentMethods(paymentMethodId);
                    console.log('payment_method_details',payment_method_details)
                    let result:{};
                    if(payment_method_details.type==subscriptionConstant.PAYMENT_MODE_TYPES.ACH_DEBIT) {
                        
                        console.log('provider',provider._id);
    
                        if(provider.subscriptionType === SUBSCRIPTION_TYPE.MONTHLY){
                            subscriptionEndDate = moment().add(NUMERIC_CONST.ONE, 'month').valueOf();
                        }
                        else{
                            subscriptionEndDate = moment().add(NUMERIC_CONST.ONE, 'year').valueOf();
                        }
                        if(eventData.paid){
                            console.log('paid*********************')
                            let params:SubscriptionRequest.addSubscription = {
                                subscriptionType: provider.subscriptionType,
                                email: provider.email,
                                userId: toObjectId(provider._id.toString()),
                                amount: eventData.amount / 100,
                                status: STATUS.ACTIVE,
                                stripeCustomerId: stripeCustomerId,
                                subscriptionEndDate: subscriptionEndDate,
                                subscriptionStartDate: Date.now(),
                                clinicName: provider.clinicName,
                                clinicId: provider.clinicId,
                                invoiceId: invoiceId,
                                created: Date.now()
                            }
                            // saving data in subscription model
                            result = await subscriptionDaoV1.addSubscription(params);
                            const step1 =await subscriptionDaoV1.findOneAndUpdate(
                                providerColl, 
                                {_id: toObjectId(params.userId), clinicId: params.clinicId, userType: USER_TYPE.PROVIDER}, 
                                {isSubscribed: true, subscriptionStartDate: params.subscriptionStartDate, subscriptionEndDate: params.subscriptionEndDate}
                            );
                            await subscriptionDaoV1.updateMany(
                                providerColl, 
                                {clinicId: params.clinicId}, 
                                {isSubscribed: true, subscriptionStartDate: params.subscriptionStartDate, subscriptionEndDate: params.subscriptionEndDate}
                            );
                            //saving data in the transacttion model
                            const transactionId: any = provider.transactionId;
                            let transaction = await transactionDaoV1.findTransactionById({
                                transactionId: transactionId
                            });
                            console.log('transaction',transaction)
                            if(!transaction) {
                                let data:any = {
                                    userId: toObjectId(provider._id.toString()),
                                    transactionId: transactionId,
                                    amount: eventData.amount / 100,
                                    originalTransactionId: invoiceId,
                                    clinicName: provider.clinicName,
                                    clinicId: provider.clinicId,
                                    status: STATUS.SUCCESS
                                }
                                await transactionControllerV1.addTransaction(data);
                            }else {
                                const transaction_status= await transactionDaoV1.updateTransactionById({
                                    transactionId: transactionId
                                }, {
                                    status:STATUS.SUCCESS
                                },{new:true});
                                console.log('transaction_status',transaction_status)
                            }
                           
                            let dashboard = {
                                type: DASHBOARD_TYPE.SUBSCRIPTION,
                                amount: eventData.amount / 100,
                                subscriptionType: provider.subscriptionType,
                            }
                            dashboard = encryptData(JSON.stringify(dashboard));
                            axiosService.post({ "url": process.env.ADMIN_APP_URL + SERVER.DASHBOARD, "body": { data: dashboard } });
                            let mailData = {
                                type: MAIL_TYPE.SUBSCRIPTION,
                                amount: step1.subscriptionCharges,
                                clinic_name: step1.clinicName,
                                duration: step1.subscriptionType,
                                contract: step1.contract,
                                email: provider.email
                            }
                            mailData = encryptData(JSON.stringify(mailData));
                            axiosService.postData({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_MAIL, "body": { data: mailData } });
                            let notificationData = {
                                type: NOTIFICATION_TYPE.PURCHASE_SUBSCRIPTION,
                                userId: [provider._id],
                                platform: DEVICE_TYPE.WEB
                            }
                            notificationData = encryptData(JSON.stringify(notificationData));
                            await this.inAppNotification(notificationData);
                        }
                    }
                    return MESSAGES.SUCCESS.DETAILS(result);
                }
                default: {
                    return subscriptionConstant.MESSAGES.ERROR.INVALID_EVENT_TYPE;
                }
            }
        } catch (error) {
            console.log('webhook error',error)
            throw error;
        }
    }

    async inAppNotification(params) {
        try {
            setTimeout(async () => {
                await axiosService.post({ "url": process.env.NOTIFICATION_APP_URL + SERVER.SEND_NOTIFICATION, "body": { data: params } });
            }, 500);
        }
        catch (error) {
            console.log('inAppNotification',error)
            throw error;
        }
    }
}

export const subscriptionController = new SubscriptionController();
