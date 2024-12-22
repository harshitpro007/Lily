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
import { patientControllerV1 } from "..";
import { getMeal, glucoseLogs, quickSummary, rpmVisitListing } from "./routeValidator";

export const patientRoute = [
    {
        method: "PATCH",
        path: `${SERVER.API_BASE_URL}/v1/provider/edit-patient`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await patientControllerV1.editPatientDetails(payload, accessToken, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "edit patient details of a clinic",
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
        path: `${SERVER.API_BASE_URL}/v1/provider/glucose-logs`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: PatientRequest.GlucoseLogs = request.query;
                const result = await patientControllerV1.getPatientGlucoseLogs(query, accessToken, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the glucose logs of a patient on the basis of date",
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
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/provider/rpm-visit`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const headers = request.headers
                const result = await patientControllerV1.addRpmVisit(payload, tokenData, headers);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "provider can add the rpm visit of an patient ",
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
        method: "PUT",
        path: `${SERVER.API_BASE_URL}/v1/provider/rpm-visit`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await patientControllerV1.editRpmVisit(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "provider can edit the rpm visit of an patient ",
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
        path: `${SERVER.API_BASE_URL}/v1/provider/meal-medication`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: PatientRequest.getMeal = request.query;
                const result = await patientControllerV1.getMealAndMedication(query, accessToken, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the meal and medication of a patient on the basis of date",
            auth: {
                strategies: ["AdminAuth"],
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
        path: `${SERVER.API_BASE_URL}/v1/provider/rpm-visit`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: PatientRequest.GetRpmVisit = request.query;
                const result = await patientControllerV1.getRpmVisitListing(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the listing of rpm visit of months",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: rpmVisitListing,
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
        path: `${SERVER.API_BASE_URL}/v1/provider/patient-summary`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: PatientRequest.QuickSummary = request.query;
                const result = await patientControllerV1.getPatientQuickSummary(query, tokenData, accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
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
        path: `${SERVER.API_BASE_URL}/v1/provider/patient-cgm`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: PatientRequest.QuickSummary = request.query;
                const result = await patientControllerV1.getPatientCgm(query, tokenData, accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "patient"],
            description: "get the summary of CGM of an patient",
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
