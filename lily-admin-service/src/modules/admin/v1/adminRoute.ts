"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { adminControllerV1 } from "@modules/admin/index";
import { 
  adminLogin,
  decrypt,
  getProfile,
  getProviders,
  Listing,
  Ticket,
  verifyToken,
} from "./routeValidator";
import Joi from "joi";

export const adminRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/admin/login`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload = request.payload;
        const remoteAddress =
          request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        const result = await adminControllerV1.login(headers, payload, remoteAddress);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "admin"],
      description: "Admin login",
      notes: "Admin login via email & password",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        payload: Joi.object({
          data: Joi.string().trim().required().description("encrypted payload for admin-login api")
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
    path: `${SERVER.API_BASE_URL}/v1/admin/forgot-password`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await adminControllerV1.forgotPassword(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "admin"],
      description: "Admin forgot password to send verification link on mail",
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
    path: `${SERVER.API_BASE_URL}/v1/admin/reset-password`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await adminControllerV1.resetPassword(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "admin"],
      description: "Reset Password After forgot password and verification link",
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
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/admin/verify-link`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const query: AdminRequest.VerifyLink = request.query;
        const result = await adminControllerV1.verifyLink(query);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "admin"],
      description: "Verify reset password link is expired on not",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        query: verifyToken,
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
    path: `${SERVER.API_BASE_URL}/v1/admin/logout`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await adminControllerV1.logout(tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "admin"],
      description: "Admin Logout",
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
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/admin/profile`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await adminControllerV1.profile(tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "admin"],
      description: "Admin Profile",
      notes: "for Admin",
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
  {
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/admin/block-unblock`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const payload = request.payload;
        const result = await adminControllerV1.updateStatus(payload,accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
      description: "Update the provider status",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: Joi.object({
					data: Joi.string().trim().optional()
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
    path: `${SERVER.API_BASE_URL}/v1/admin/change-password`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await adminControllerV1.changePassword(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "admin"],
      description: "Update admin password",
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
    path: `${SERVER.API_BASE_URL}/v1/admin/profile`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await adminControllerV1.changeProfile(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "admin"],
      description: "Update admin's profile",
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
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/admin/encrypt`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await adminControllerV1.encrypt(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "internal"],
      description: "encrypt payload data",
      validate: {
      payload: adminLogin,
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
    path: `${SERVER.API_BASE_URL}/v1/admin/decrypt`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await adminControllerV1.decrypt(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "internal"],
      description: "decrypt data to payload",
      validate: {
      payload: decrypt,
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
    path: `${SERVER.API_BASE_URL}/v1/admin/provider`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const payload = request.payload;
        const result = await adminControllerV1.createProvider(payload, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "Create provider",
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
    path: `${SERVER.API_BASE_URL}/v1/admin/provider`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const query: AdminRequest.ProviderListing = request.query;
        const result = await adminControllerV1.getProviderListing(query, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "get provider listing",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getProviders,
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
		path: `${SERVER.API_BASE_URL}/v1/admin/preSignedUrl`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const payload = request.payload
				const result = await adminControllerV1.preSignedURL(payload,tokenData);
				return responseHandler.sendSuccess(request, h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "User List",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					data: Joi.string().trim().required()
				}),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/admin/provider-profile`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        const query: UserId = request.query;
        const result = await adminControllerV1.providerProfile(query, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "Provider Profile",
      notes: "for Admin",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getProfile,
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
    path: `${SERVER.API_BASE_URL}/v1/admin/resend-invite`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        const payload = request.payload;
        const result = await adminControllerV1.resendInvite(payload, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "resend invite to provider",
      notes: "Resend Invite to the provider",
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
    path: `${SERVER.API_BASE_URL}/v1/admin/ticket-listing`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        const query = request.query;
        const result = await adminControllerV1.ticketListing(query, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "support"],
      description: "support ticket listing",
      notes: "support ticket listing for admin",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: Listing,
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
    path: `${SERVER.API_BASE_URL}/v1/admin/ticket-details`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        const query = request.query;
        const result = await adminControllerV1.ticketDetails(query, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "support"],
      description: "get ticket details",
      notes: "get ticket details for admin",
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
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/admin/ticket-status`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const payload = request.payload;
        const result = await adminControllerV1.ticketStatus(payload,accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "support"],
      description: "update ticket status",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        payload: Joi.object({
					data: Joi.string().trim().optional()
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
    path: `${SERVER.API_BASE_URL}/v1/admin/provider`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const payload = request.payload;
        const result = await adminControllerV1.editProvider(payload, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "Edit provider details",
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
];
