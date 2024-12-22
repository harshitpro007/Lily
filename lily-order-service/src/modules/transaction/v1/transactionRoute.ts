"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { transactionControllerV1 } from "..";
import { allTransaction, getTotalAmount, transactions } from "./routeValidator";

export const transactionRoute = [
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/order/transactions`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: TransactionRequest.TransactionListing = request.query;
                const result = await transactionControllerV1.getTransactionListing(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: "get listing of transactions of a clinic",
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
        path: `${SERVER.API_BASE_URL}/v1/order/all-transactions`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: TransactionRequest.TransactionListing = request.query;
                const result = await transactionControllerV1.getAllTransactionListing(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: "get listing of all transactions of clinics",
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
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/order/amount`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const result = await transactionControllerV1.getPaymentsAmount(tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: "get the sum of last and current month transaction amount.",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
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
        path: `${SERVER.API_BASE_URL}/v1/order/amount-log`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: TransactionRequest.Amount = request.query;
                const result = await transactionControllerV1.getTotalAmount(query,tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: "Get the total amounte of a month from transactions.",
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
    },
];
