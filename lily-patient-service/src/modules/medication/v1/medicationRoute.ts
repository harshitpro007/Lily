"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
    SWAGGER_DEFAULT_RESPONSE_MESSAGES,
    SERVER
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import Joi from "joi";
import { medicationControllerV1 } from "..";
import { medicationLogs, quickSummary } from "./routeValidation";

export const medicationRoute = [
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/patient/medication`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await medicationControllerV1.addMedication(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "medication"],
            description: "Add the medication of patient",
            auth: {
                strategies: ["UserAuth"],
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
        method: "PATCH",
        path: `${SERVER.API_BASE_URL}/v1/patient/medication`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await medicationControllerV1.editMedication(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "medication"],
            description: "update the medication of patient",
            auth: {
                strategies: ["UserAuth"],
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
        path: `${SERVER.API_BASE_URL}/v1/patient/medication-logs`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MedicationRequest.getMedication = request.query;
                const result = await medicationControllerV1.getMedicationLogs(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "medication"],
            description: "get the medication Logs of patient",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: medicationLogs, 
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
        path: `${SERVER.API_BASE_URL}/v1/patient/quick-summary`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MedicationRequest.QuickSummary = request.query;
                const result = await medicationControllerV1.getPatientQuickSummary(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: " get the summary of meal and medication of an patient",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: quickSummary, 
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
