"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { headerObject } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import Joi from "joi";
import { notificationControllerV1 } from "..";

export const notificationRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/notification/email-template`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.emailHandler(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "send email template",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
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
    path: `${SERVER.API_BASE_URL}/v1/notification/send`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.sendNotification(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "send notification to user",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
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
    path: `${SERVER.API_BASE_URL}/v1/notification/message`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.sendMessage(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "send message notification",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
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
    path: `${SERVER.API_BASE_URL}/v1/notification/send-notification`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await notificationControllerV1.sendPushNotification(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
      description: "send push notification to user",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
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
