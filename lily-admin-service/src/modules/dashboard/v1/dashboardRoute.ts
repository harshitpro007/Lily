"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import Joi from "joi";
import { dashboardControllerV1 } from "..";

export const dashboardRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/admin/dashboard`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await dashboardControllerV1.updateDashboardData(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
      description: "update the data for dashboard like total Users, Subscription",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
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
    path: `${SERVER.API_BASE_URL}/v1/admin/dashboard`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const result = await dashboardControllerV1.dashboard();
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "dashboard"],
      description: "get dashboard details",
      notes: "get dashboard details for admin",
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
