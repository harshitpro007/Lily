"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { providerControllerV1 } from "@modules/provider/index";
import {
  decrypt,
  getProfile,
  getPatients,
  getProviders,
  getPatientProfile,
  verifyToken,
  getProvidersListing,
  providerDetails,
  clinicDetail,
  providerDetail,
  getCityState,
  searchProviders,
  libra,
  epicUser,
  epic,
  dexcom,
} from "./routeValidator";
import Joi from "joi";
import { addSubscription } from "@modules/subscription/v1/routeValidator";

export const providerRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/provider`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.createProvider(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
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
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/provider/login`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload = request.payload;
        const remoteAddress =
          request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        const result = await providerControllerV1.login(headers, payload, remoteAddress);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "Admin login",
      notes: "provider login via email & password",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/forgot-password`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await providerControllerV1.forgotPassword(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
      description: "Forgot Password",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/reset-password`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await providerControllerV1.resetPassword(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
      description: "Reset Password After forgot password and verify OTP",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/verify-link`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const query: ProviderRequest.VerifyLink = request.query;
        const result = await providerControllerV1.verifyLink(query);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
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
    path: `${SERVER.API_BASE_URL}/v1/provider/logout`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await providerControllerV1.logout(tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "Provider Logout",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/profile`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const query: UserId = request.query;
        console.log('queryqueryqueryquery',query)
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await providerControllerV1.profile(query, tokenData);
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
    method: "PATCH",
    path: `${SERVER.API_BASE_URL}/v1/provider/block-unblock`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.updateStatus(payload,tokenData);
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
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/provider/change-password`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.changePassword(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
      description: "Update the Provider password",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/profile`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.changeClinicProfile(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
      description: "Update clinic's profile",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/encrypt`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await providerControllerV1.encrypt(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "internal"],
      description: "get the encrypted data",
      validate: {
        payload: addSubscription,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/decrypt`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload = request.payload;
        const result = await providerControllerV1.decrypt(payload);
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
    path: `${SERVER.API_BASE_URL}/v1/provider/patient`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.createPatient(payload, accessToken,tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "patient"],
      description: "Create patient",
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
    path: `${SERVER.API_BASE_URL}/v1/provider`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ProviderRequest.ProviderListing = request.query;
        const result = await providerControllerV1.getProviderListing(query, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
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
    method: "GET",
    path: `${SERVER.API_BASE_URL}/v1/provider/patient`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ProviderRequest.PatientListing = request.query;
        const result = await providerControllerV1.getPatientListing(query, tokenData, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "patient"],
      description: "get patient listing",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getPatients,
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
		path: `${SERVER.API_BASE_URL}/v1/provider/preSignedUrl`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth?.credentials?.tokenData;
				const payload = request.payload
				const result = await providerControllerV1.preSignedURL(payload,tokenData);
				return responseHandler.sendSuccess(request, h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "provider"],
			description: "Generate PreSigned Url",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/patient-profile`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken = request.headers.authorization;
        const tokenData:TokenData = request.auth?.credentials?.tokenData;
        const query: UserId = request.query;
        const result = await providerControllerV1.getPatientProfile(query, accessToken, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "patient"],
      description: "get provider listing",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getPatientProfile,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/ehrlogin`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload = request.payload;
        const remoteAddress =
        request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        const result = await providerControllerV1.ehrLogin(payload, headers, remoteAddress);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "provider login",
      notes: "provider login with EHR",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/resend-invite`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.resendInvite(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
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
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/provider/reinvite`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.resendInviteToPatient(payload, accessToken, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "patient"],
      description: "resend invite to patient",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/create`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const headers = request.headers;
        const result = await providerControllerV1.addProvider(payload, tokenData, headers);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "add providers in clinic",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/all-providers`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ProviderRequest.ProviderListing = request.query;
        const result = await providerControllerV1.getProvidersListing(query, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "get all providers listing of a clinic",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getProvidersListing,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/details`,
    handler: async (request: any, h: ResponseToolkit) => {
      try{
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: UserId = request.query;
        const result = await providerControllerV1.getProviderDetails(query, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "get providers details of a clinic",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: providerDetails,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/change-profile`,
    handler: async (request: any, h: ResponseToolkit) => {
      try{
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const headers = request.headers;
        const result = await providerControllerV1.updateProviderDetails(payload, tokenData, headers);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "update the details of provider",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/search-clinic`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ProviderRequest.Clinic = request.query;
        const result = await providerControllerV1.getClinicData(query, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "internal"],
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
    path: `${SERVER.API_BASE_URL}/v1/provider/search-provider`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ProviderRequest.Provider = request.query;
        const result = await providerControllerV1.getProviderData(query, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "internal"],
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
    path: `${SERVER.API_BASE_URL}/v1/provider/city`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const query: ProviderRequest.GetCity = request.query;
        const result = await providerControllerV1.getCityState(query);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "provider"],
      description: "Get the city and state using zipcode",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: getCityState,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/search`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const query: ProviderRequest.ProviderListing = request.query;
        const result = await providerControllerV1.searchProviders(query, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "search providers by name of a clinic",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: searchProviders,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/patient-status`,
    handler: async (request: any, h: ResponseToolkit) => {
      try{
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const result = await providerControllerV1.editPatientStatus(payload, tokenData);
        return responseHandler.sendSuccess(request, h, result);
      }
      catch(error){
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "provider"],
      description: "update the status of patient",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/clinic`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const payload = request.payload;
        const headers = request.headers;
        const result = await providerControllerV1.editProvider(payload, tokenData, headers);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "internal"],
      description: "edit provider details",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/notification-count`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const tokenData: TokenData = request.auth?.credentials?.tokenData;
        const result = await providerControllerV1.getUnreadNotificaionCount(tokenData);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "notification"],
      description: "get the count of unread notifications",
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
    path: `${SERVER.API_BASE_URL}/v1/provider/libra`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const query = request.query;
        const result = await providerControllerV1.getLibraDetails(query);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "libra"],
      description: "libra device logs",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        query: libra,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/dexcom`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const query = request.query;
        const result = await providerControllerV1.getDexcomDetails(query);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "Dexcom"],
      description: "Dexcom device logs",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        query: dexcom,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/epic-search`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        let query = request.query;
        const result = await providerControllerV1.getEpicPatientDetails(query, accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "patient"],
      description: "get the details of user from epic",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: epicUser,
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
    path: `${SERVER.API_BASE_URL}/v1/provider/epic-details`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const accessToken: string = request.headers.authorization;
        const query = request.query;
        const result = await providerControllerV1.getEpicPatientDetailsById(query,accessToken);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "patient"],
      description: "get the details of user from epic",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        headers: authorizationHeaderObj,
        query: epic,
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
