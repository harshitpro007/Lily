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
import { mealControllerV1 } from "..";
import { getDeviceHsitory, getMeal, glucoseAverages, GlucoseHistory, glucoseLogs, logs, mealLogs } from "./routeValidator";
import { quickSummary } from "@modules/medication/v1/routeValidation";

export const mealRoute = [
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/patient/meal`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await mealControllerV1.addMeal(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "Add the meal of patient",
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
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/patient/glucose`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await mealControllerV1.addGlucose(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "Add the meal of patient",
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
        path: `${SERVER.API_BASE_URL}/v1/patient/meal`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await mealControllerV1.editMeal(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "update the meal of patient",
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
        path: `${SERVER.API_BASE_URL}/v1/patient/meal-medication`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MealRequest.getMeal = request.query;
                const result = await mealControllerV1.getMealMedication(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "get the meal of patient",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getMeal, 
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
        path: `${SERVER.API_BASE_URL}/v1/patient/glucolive`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const headers = request.headers;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MealRequest.getMeal = request.query;
                const result = await mealControllerV1.getGlucoLive(query, tokenData,headers);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "get the glucose Logs of patient for home",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: logs, 
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
        path: `${SERVER.API_BASE_URL}/v1/patient/meal-logs`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MealRequest.getMeal = request.query;
                const result = await mealControllerV1.getMealLogs(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "get the meal Logs of patient",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: mealLogs, 
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
        path: `${SERVER.API_BASE_URL}/v1/patient/glucose-logs`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MealRequest.GlucoseLogs = request.query;
                const result = await mealControllerV1.getGlucoseLogs(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "internal"],
            description: "get the glucose Logs of patient for provider",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: glucoseLogs, 
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
        path: `${SERVER.API_BASE_URL}/v1/patient/cgm-profile`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MedicationRequest.QuickSummary = request.query;
                const result = await mealControllerV1.getPatientCgmDetails(query, tokenData);
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
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/patient/averages`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MealRequest.Averaves = request.query;
                const headers = request.headers;
                const result = await mealControllerV1.getGlucoseAverages(query, tokenData, headers);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "Get the averages of glucose",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: glucoseAverages, 
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
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/patient/device-history`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await mealControllerV1.addDeviceHistory(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "Add the device data of patient",
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
        path: `${SERVER.API_BASE_URL}/v1/patient/device-history`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query:MealRequest.GetDeviceData = request.query;
                const result = await mealControllerV1.getDeviceHistory(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the device data of patient",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getDeviceHsitory,
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
        method: "PUT",
        path: `${SERVER.API_BASE_URL}/v1/patient/glucose`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const payload = request.payload;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const result = await mealControllerV1.editGlucose(payload,tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "meal"],
            description: "edit glucose value of a patient",
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
        path: `${SERVER.API_BASE_URL}/v1/patient/glucose-data`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query:MealRequest.GetDeviceData = request.query;
                const result = await mealControllerV1.getPatientGlucoseData(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the device data of patient",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getDeviceHsitory,
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
        path: `${SERVER.API_BASE_URL}/v1/patient/glucose-history`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query:MealRequest.GlucoseHistory = request.query;
                const result = await mealControllerV1.getGlucoseAndRpmHistoryData(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the device data of patient",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: GlucoseHistory,
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
