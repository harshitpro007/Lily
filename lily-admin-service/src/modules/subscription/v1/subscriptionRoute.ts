"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { subscriptionControllerV1 } from "..";
import { allTransaction, getClinicSubscription, getTotalAmount, subscriptionDetails, transactions } from "./routeValidator";
import Joi from "joi";

export const subscriptionRoute = [
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/subscription`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: SubscriptionRequest.SubscriptionListing = request.query;
                const result = await subscriptionControllerV1.getSubscriptions(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "subscription"],
            description: "Get the listing of all the clinic subscriptions",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getClinicSubscription,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/subscription-details`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: SubscriptionRequest.SubscriptionDetails = request.query;
                const result = await subscriptionControllerV1.getSubscriptionDetails(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "subscription"],
            description: "Get the details of the clinic subscriptions",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: subscriptionDetails,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/transactions`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: SubscriptionRequest.TransactionListing = request.query;
                const result = await subscriptionControllerV1.getTransactionListing(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "subscription"],
            description: "Get the listing of the clinic transactions",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: transactions,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/all-transactions`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: SubscriptionRequest.TransactionListing = request.query;
                const result = await subscriptionControllerV1.getAllTransactionListing(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "subscription"],
            description: "Get the listing of all clinic transactions",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: allTransaction,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "PATCH",
        path: `${SERVER.API_BASE_URL}/v1/admin/subscription`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const payload = request.payload;
                const result = await subscriptionControllerV1.editSubscriptionDetails(payload, accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "subscription"],
            description: "edit subscription details of a clinic",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                payload: Joi.object({
                    data: Joi.string().trim().required()
                }),
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    },
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/amount-log`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: SubscriptionRequest.Amount = request.query;
                const result = await subscriptionControllerV1.getAmount(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "subscription"],
            description: "Get the total amount of a month from transactions",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getTotalAmount,
                failAction: failActionFunction,
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES,
                },
            },
        },
    }
];
