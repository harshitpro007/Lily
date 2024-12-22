import { ResponseToolkit } from "@hapi/hapi";
import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import { SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { authControllerV1 } from "..";
import { badRequestSchema, createTokenSchema, internalServerSchema } from "./swaggerResponse";
import Joi from "joi";

export const authRoute = [
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/create-auth-token`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload = request.payload;
        console.log(payload);
        payload.remoteAddress = request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        const result = await authControllerV1.createAuthToken(headers,payload);
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "auth"],
      description: "Create Auth Token ",
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
          responses: {
            201: {
              description: 'Success',
              schema: createTokenSchema
            },
            400: {
              description: 'Bad Request',
              schema: badRequestSchema
            },
            500: {
              description: 'Internal Server Error',
              schema: internalServerSchema
            }
          }
        },
      },
    }
  },
  {
    method: "GET",
    path: `${SERVER.API_BASE_URL}/verify-auth-token`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const query = request.headers;
        const result = await authControllerV1.verifyToken(query);
        return responseHandler.sendSuccess(request, h, {...result, ...request.auth});
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "auth"],
      description: "Verify Auth Token",
      notes: "for User",
      auth: {
        strategies: ["AdminAuth"],
      },
      validate: {
        failAction: failActionFunction,
        headers: authorizationHeaderObj
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: 'Success',
              schema: createTokenSchema
            },
            401: {
              description: 'Unauthorized',
            },
            400: {
              description: 'Bad Request',
              schema: badRequestSchema
            },
            500: {
              description: 'Internal Server Error',
              schema: internalServerSchema
            }
          }
        },
      },
    },
  },
  {
    method: "POST",
    path: `${SERVER.API_BASE_URL}/admin-auth-token`,
    handler: async (request: any, h: ResponseToolkit) => {
      try {
        const headers = request.headers;
        const payload = request.payload;
        console.log({payload});
        console.log({headers});
        payload.remoteAddress = request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
        console.log({"remoteAddress": payload.remoteAddress});
        const result = await authControllerV1.adminTokenVerification(payload, headers)
        console.log({result});
        return responseHandler.sendSuccess(request, h, result);
      } catch (error) {
        return responseHandler.sendError(request, error);
      }
    },
    options: {
      tags: ["api", "auth"],
      description: "Create admin Auth Token ",
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
          responses: {
            201: {
              description: 'Success',
              schema: createTokenSchema
            },
            400: {
              description: 'Bad Request',
              schema: badRequestSchema
            },
            500: {
              description: 'Internal Server Error',
              schema: internalServerSchema
            }
          }
        },
      },
    }
  },
  
  
];