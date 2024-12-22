"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { clinicDetail, getAllPatients, patientDetails, PatientGlucoseAndRpmData, providerDetail } from "./routeValidator";
import { patientControllerV1 } from "..";
import Joi from "joi";

export const patientRoute = [
    {
        method: "GET",
        path: `${SERVER.API_BASE_URL}/v1/admin/all-patient`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: PatientRequest.PatientListing = request.query;
                const result = await patientControllerV1.getAllPatients(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Get the listing of all the patients",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: getAllPatients,
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
        path: `${SERVER.API_BASE_URL}/v1/admin/search-clinic`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: PatientRequest.Clinic = request.query;
                const result = await patientControllerV1.getClinicData(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Get the details of clinic by clinic name",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: clinicDetail,
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
        path: `${SERVER.API_BASE_URL}/v1/admin/search-provider`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: PatientRequest.Provider = request.query;
                const result = await patientControllerV1.getproviderData(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Get the details of provider by provider name",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: providerDetail,
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
        path: `${SERVER.API_BASE_URL}/v1/admin/patient`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: UserId = request.query;
                const result = await patientControllerV1.getPatientsDetails(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Get the details of a patients",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: patientDetails,
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
        path: `${SERVER.API_BASE_URL}/v1/admin/reset-password`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const payload = request.payload;
                const result = await patientControllerV1.resetPatientPassword(payload,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Reset the patient's password",
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
        method: "PATCH",
        path: `${SERVER.API_BASE_URL}/v1/admin/block-patient`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const payload = request.payload;
                const result = await patientControllerV1.updatePatientStatus(payload,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Update the status of patient",
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
        path: `${SERVER.API_BASE_URL}/v1/admin/patient-rpm`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const accessToken: string = request.headers.authorization;
                const query: PatientRequest.PatientRpmData = request.query;
                const result = await patientControllerV1.getRpmAndGlucoseHistoryData(query,accessToken);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        config: {
            tags: ["api", "patient"],
            description: "Get the details of a patients",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: PatientGlucoseAndRpmData,
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
