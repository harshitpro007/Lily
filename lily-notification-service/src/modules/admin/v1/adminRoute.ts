"use strict";

import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { headerObject } from "@utils/validator";
import {
  SWAGGER_DEFAULT_RESPONSE_MESSAGES,
  SERVER,
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { adminControllerV1 } from "@modules/admin/index";
import { sendOtp, verifyOtp } from "./routeValidator";

export const adminRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/v1/admin/send-otp`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const payload: AdminRequest.SendOtp = request.payload;
        const result = await adminControllerV1.sendOTP(payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "admin"],
      description: "Send/Resend Otp On Email/mobile no",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        payload: sendOtp,
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
    path: `${SERVER.API_BASE_URL}/v1/admin/verify-otp`,
    handler: async (request:  any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload: AdminRequest.VerifyOTP = request.payload;
        payload.remoteAddress =
          request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        const result = await adminControllerV1.verifyOTP({
          ...headers,
          ...payload,
        });
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    config: {
      tags: ["api", "admin"],
      description: "Verify OTP on Forgot Password/Verify Phone Number",
      auth: {
        strategies: ["BasicAuth"],
      },
      validate: {
        headers: headerObject["required"],
        payload: verifyOtp,
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
