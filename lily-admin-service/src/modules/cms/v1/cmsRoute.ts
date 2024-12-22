"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { cmsControllerV1 } from "@modules/cms/index";
import Joi from "joi";
import { getCms, getFaq, getFaqs } from "./routeValidator";

export const cmsRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/common/create-cms`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await cmsControllerV1.cmsManagement(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "cms"],
      description: "terms & conditions",
      notes: "create or update terms & conditions",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: Joi.object({
          data: Joi.string().trim().required().description("encrypted payload for t&c api")
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
    path: `${SERVER.API_BASE_URL}/v1/common/cms`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.query;
        const result = await cmsControllerV1.getCms(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "cms"],
      description: "get cms t&c or privacy policy",
      notes: "get t&c or privacy policy details",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        query: getCms,
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
    path: `${SERVER.API_BASE_URL}/v1/common/faq`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await cmsControllerV1.createFaq(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "cms"],
      description: "add faq",
      notes: "create faq",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: Joi.object({
          data: Joi.string().trim().required().description("encrypted payload for create faq")
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
    path: `${SERVER.API_BASE_URL}/v1/common/faq`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await cmsControllerV1.updateFaq(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "cms"],
      description: "add faq",
      notes: "create faq",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: Joi.object({
          data: Joi.string().trim().required().description("encrypted payload for update faq")
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
    path: `${SERVER.API_BASE_URL}/v1/common/faq`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.query;
        const result = await cmsControllerV1.getFaq(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "cms"],
      description: "get faq",
      notes: "get faq details",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getFaq,
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
    path: `${SERVER.API_BASE_URL}/v1/common/faq-listing`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.query;
        const result = await cmsControllerV1.getFaqs(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "cms"],
      description: "get faq listing details",
      notes: "get faq listing details",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        query: getFaqs,
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
