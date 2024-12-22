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
import { notificationControllerV1 } from "..";
import { notificationListing } from "./routeValidator";

export const notificationRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/patient/notification`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.createNotification(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
      description: "create notification at app side for multiple configuration",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: Joi.object({
          data: Joi.string().trim().required().description("encrypted payload for create notification api")
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
    path: `${SERVER.API_BASE_URL}/v1/patient/notification`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ListingRequest = request.query;
        const result = await notificationControllerV1.getNotificationListing(query,tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "get the notification listing of user",
      auth: {
        strategies: ["UserAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: notificationListing,
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
    path: `${SERVER.API_BASE_URL}/v1/patient/notification`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await notificationControllerV1.updateNotification(tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "update notification status",
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
];
