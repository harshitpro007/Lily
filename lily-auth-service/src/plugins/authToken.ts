"use strict";
import AuthBearer from "hapi-auth-bearer-token";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { logger } from "@lib/logger";

import {
	userDaoV1,
	userControllerV1
} from "@modules/user/index";
import { loginHistoryDao } from "@modules/loginHistory/index"

import { buildToken } from "@utils/appUtils";
import { MESSAGES, STATUS, SERVER } from "@config/index";
import { redisClient } from "@lib/redis/RedisClient";
import { responseHandler } from "@utils/ResponseHandler";
import { validate, validateAdmin, validateRefrehToken, validateTokenData } from "@lib/tokenManager";
import { request } from "http";
import { UUID } from "mongodb";

// Register Authorization Plugin
export const plugin = {
	name: "auth-token-plugin",
	register: async function (server) {
		await server.register(AuthBearer);

		/**
		 * @function UserAuth
		 */
		server.auth.strategy("AdminAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			allowChaining: false,
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValidApiKey = await apiKeyFunction(request.headers.api_key);
					if (!isValidApiKey) {
						return { isValid: false, credentials: { accessToken: accessToken, tokenData: {} } };
					} else {
						const payload = await adminValidateAccessToken(accessToken, request);
						await validateTokenData(payload, request);

						if (SERVER.IS_REDIS_ENABLE) {
							return handleRedisValidation(payload, request);
						} else {
							return handleDefaultValidation(payload, request);
						}
					}
				} catch (error) {
					logger.error(error);
					throw error;
				}
			},
		});

		/**
		 * @function UserAuth
		 */
		server.auth.strategy("UserAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "accessToken",
			allowChaining: false,
			validate: async (request: Request, accessToken: string, h: ResponseToolkit) => {
				try {
					const isValidApiKey = await apiKeyFunction(request.headers.api_key);
					if (!isValidApiKey) {
						return { isValid: false, credentials: { accessToken: accessToken, tokenData: {} } };
					} else {
						const payload = await validateAccessToken(accessToken, request);
						await validateTokenData(payload, request);

						if (SERVER.IS_REDIS_ENABLE) {
							return handleRedisValidation(payload, request);
						} else {
							return handleDefaultValidation(payload, request);
						}
					}
				} catch (error) {
					logger.error(error);
					throw error;
				}
			},
		});

		async function adminValidateAccessToken(accessToken: string, request: Request){
			return validateAdmin(accessToken, request);
		}

		async function validateAccessToken(accessToken: string, request: Request) {
			return validate(accessToken, request);
		}

		async function handleRedisValidation(payload: any, request: Request) {
			console.log('************handleRedisValidation*******************',payload);
			let userData: any = await redisClient.getValue(`${payload.sub}.${payload.deviceId}`);
			userData = JSON.parse(userData);

			if (!userData) {
				userData = await handleUserDataRetrieval(payload);
			}

			return handleTokenValidation(userData, payload, request);
		}

		async function handleDefaultValidation(payload: any, request: Request) {
			const userData = await userDaoV1.findUserById(payload.sub);
			if (!userData) {
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
			}

			return handleTokenValidation(userData, payload, request);
		}

		async function handleUserDataRetrieval(payload: any) {
			const userData = await userDaoV1.findUserById(payload.sub);
			const step1 = await loginHistoryDao.findDeviceById({ "userId": payload.sub, "deviceId": payload.deviceId, "salt": payload.prm });
			if (!userData || !step1) {
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
			}

			return { ...userData, ...step1 };
		}

		async function handleTokenValidation(userData: any, payload: any, request: Request) {
			if (userData.salt !== payload.prm) {
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
			}

			const tokenData = buildToken({ ...userData });

			if (userData.status === STATUS.BLOCKED) {
				await userControllerV1.removeSession(tokenData, true);
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
			} else {
				return { isValid: true, credentials: { "accessToken": payload, "tokenData": tokenData } };
			}
		}

		async function handleDefaultValidationRefresh(payload: any, request: Request) {
			const userData = await userDaoV1.findUserById(payload.sub);
			if (!userData) {
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));//NOSONAR
			}

			return handleTokenValidationRefresh(userData, payload, request);
		}



		async function handleTokenValidationRefresh(userData: any, payload: any, request: Request) {
			const tokenData = buildToken({ ...userData ,...payload});

			if (userData.status === STATUS.BLOCKED) {
				await userControllerV1.removeSession(tokenData, true);
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));//NOSONAR
			} else {
				return { isValid: true, credentials: { "accessToken": payload, "tokenData": tokenData } };
			}
		}

		/**
		 * @function RefreshToken
		 */
		server.auth.strategy("RefreshToken", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			accessTokenName: "RefreshToken",
			allowChaining: false,
			validate: async (request: Request, RefreshToken: string, h: ResponseToolkit) => {
				try {
					const isValidApiKey = await apiKeyFunction(request.headers.api_key);

					if (!isValidApiKey) {
						return { isValid: false, credentials: { RefreshToken: RefreshToken, tokenData: {} } };
					} else {
						const payload = await validateRefreshToken(RefreshToken, request);
						await validateTokenData(payload, request);
						const check ={
							userId:(payload.sub),
							refreshJti:new UUID(payload.jti)
						}
					}
				} catch (error) {
					logger.error(error);
					throw error;
				}
			},
		});
         
		async function validateRefreshToken(accessToken: string, request: Request) {
			return validateRefrehToken(accessToken, request);
		}

		await server.register(require("hapi-auth-basic"));

		/**
		 * @function BasicAuth
		 */
		server.auth.strategy("BasicAuth", "bearer-access-token", {
			tokenType: "Basic",
			validate: async (request: Request, token, h: ResponseToolkit) => {
				// validate user and pwd here
				const isValidApiKey = await apiKeyFunction(request.headers.api_key);
				if (!isValidApiKey) {
					return { isValid: false, credentials: { token, tokenData: {} } };
				} else {
					const checkFunction = await basicAuthFunction(token);
					if (!checkFunction) {
						return ({ isValid: false, credentials: { token, userData: {} } });
					}
					return ({ isValid: true, credentials: { token, userData: {} } });
				}
			}
		});

		/**
		 * @function DoubleAuth -: conbination of both basic auth and user auth
		 */
		server.auth.strategy("DoubleAuth", "bearer-access-token", {
			allowQueryToken: false,
			allowMultipleHeaders: true,
			validate: async (request: Request, accessToken, h: ResponseToolkit) => {
				const checkFunction = await basicAuthFunction(accessToken);
				if (checkFunction) {
					return ({ isValid: true, credentials: { token: accessToken, userData: {} } });
				}
			}
		});
	}
};

const apiKeyFunction = async function (apiKey) {
	try {
		return (apiKey === SERVER.API_KEY);
	} catch (error) {
		logger.error(error);
		throw error;
	}
};

const basicAuthFunction = async function (accessToken) {
	const credentials = Buffer.from(accessToken, "base64").toString("ascii");
	const [username, password] = credentials.split(":");
	if (username !== SERVER.BASIC_AUTH.NAME || password !== SERVER.BASIC_AUTH.PASS) { return false; }
	return true;
};