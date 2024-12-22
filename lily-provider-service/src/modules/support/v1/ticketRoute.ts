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
import { ticketControllerV1 } from "..";
import { Ticket, ticketListing } from "./routeValidator";

export const ticketRoute = [
    {
        method: "POST",
        path: `${SERVER.API_BASE_URL}/v1/provider/ticket`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const tokenData: TokenData = request.auth?.credentials?.tokenData;
                const payload = request.payload;
                const result = await ticketControllerV1.createTicket(payload, tokenData);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "ticket"],
            description: "create ticket for provider",
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
        path: `${SERVER.API_BASE_URL}/v1/provider/ticket`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const payload = request.payload;
                const result = await ticketControllerV1.editTicket(payload);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "ticket"],
            description: "update ticket for provider",
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
        path: `${SERVER.API_BASE_URL}/v1/provider/ticket`,
        handler: async (request: any, h: ResponseToolkit) => {
            try {
                const params = request.query;
                const result = await ticketControllerV1.getTicket(params);
                return responseHandler.sendSuccess(request, h, result);
            } catch (error) {
                return responseHandler.sendError(request, error);
            }
        },
        options: {
            tags: ["api", "ticket"],
            description: "get ticket details for provider",
            auth: {
                strategies: ["AdminAuth"],
            },
            validate: {
                headers: authorizationHeaderObj,
                query: Ticket,
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
            path: `${SERVER.API_BASE_URL}/v1/provider/ticket-listing`,
            handler: async (request: any, h: ResponseToolkit) => {
                try {
                    const tokenData: TokenData = request.auth?.credentials?.tokenData;
                    const params = request.query;
                    const result = await ticketControllerV1.ticketListingDetails(params,tokenData);
                    return responseHandler.sendSuccess(request, h, result);
                } catch (error) {
                    return responseHandler.sendError(request, error);
                }
            },
            options: {
                tags: ["api", "ticket"],
                description: "get ticket listing for provider",
                auth: {
                    strategies: ["AdminAuth"],
                },
                validate: {
                    headers: authorizationHeaderObj,
                    query: ticketListing,
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
