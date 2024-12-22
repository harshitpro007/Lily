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
import { exerciseControllerV1 } from "..";
import { exercise } from "./routeValidation";

export const exerciseRoute = [
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/patient/exercise`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await exerciseControllerV1.addExercise(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "exercise"],
            description: "Add the exercise of patient",
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
        path: `${SERVER.API_BASE_URL}/v1/patient/exercise`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const query: MedicationRequest.getMedication = request.query;
                const result = await exerciseControllerV1.getExercise(query, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "exercise"],
            description: "get the exercise of patient",
            auth: {
                strategies: ["UserAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: exercise, 
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
        path: `${SERVER.API_BASE_URL}/v1/patient/health`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await exerciseControllerV1.healthDetails(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "exercise"],
            description: "Add health of patient from device",
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
];
