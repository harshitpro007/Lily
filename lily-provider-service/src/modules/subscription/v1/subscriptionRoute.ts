"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import Joi from "joi";
import { subscriptionControllerV1 } from "..";
import { getClinicSubscription, subscriptionDetails } from "./routeValidator";

export const subscriptionRoute = [
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/provider/subscription`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await subscriptionControllerV1.addSubscription(payload, tokenData, accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "subscription"],
            description: "add subscription of a clinic",
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
        path: `${SERVER.API_BASE_URL}/v1/provider/subscription-details`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: SubscriptionRequest.SubscriptionDetails = request.query;
                const result = await subscriptionControllerV1.getSubscriptionDetails(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "subscription"],
            description: "get subscription details of a clinic",
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
        path: `${SERVER.API_BASE_URL}/v1/provider/subscriptions`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const accessToken: string = request.headers.authorization;
                const query: SubscriptionRequest.SubscriptionListing = request.query;
                const result = await subscriptionControllerV1.getSubscriptionListing(query, tokenData, accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: "get subscription listing of a clinic",
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
        method: "PATCH",
        path: `${SERVER.API_BASE_URL}/v1/provider/subscription`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await subscriptionControllerV1.editSubscriptionDetails(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
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
        path: `${SERVER.API_BASE_URL}/v1/provider/handler`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const query = request.query;
                console.log('query webhook handler',query)
                const result = await subscriptionControllerV1.handler(query);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "order"],
            description: "order handler",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: Joi.object({
                    transactionId: Joi.string().required()
                }),
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
