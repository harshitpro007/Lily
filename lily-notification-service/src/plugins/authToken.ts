"use strict";
import AuthBearer from "hapi-auth-bearer-token";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { logger } from "@lib/logger";

import { loginHistoryDao } from "@modules/loginHistory/index"

import { buildToken } from "@utils/appUtils";
import { MESSAGES, STATUS, SERVER } from "@config/index";
import { redisClient } from "@lib/redis/RedisClient";
import { responseHandler } from "@utils/ResponseHandler";
import { request } from "http";
import { axiosService } from "@lib/axiosService";
import { adminControllerV1, adminDaoV1 } from "@modules/admin";

// Register Authorization Plugin
export const plugin = {
	name: "auth-token-plugin",
	register: async function (server) {
		await server.register(AuthBearer);

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
						try {
							const payload = await axiosService.getData({"url":process.env.AUTH_APP_URL+SERVER.VERIFY_AUTH_TOKEN, "body":{}, auth: 'Bearer '+accessToken });
							payload["credentials"]["tokenData"]["userId"] = payload.data.sub;
							return { isValid: true, credentials: { "accessToken": payload.credentials.accessToken, "tokenData": payload.credentials.tokenData } };

						} catch (e){
							console.log("e.response.data.error === >",e.response.data);
							if(e.response.data.type == "SESSION_EXPIRED"){
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
							}
							if(e.response.data.type == "BAD_TOKEN"){
								return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
							}
						}
					}
				} catch (error) {
					logger.error(error);
					throw error;
				}
			},
		});
		
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
					try {
						const payload = await axiosService.getData({ "url": process.env.AUTH_APP_URL + SERVER.VERIFY_AUTH_TOKEN, "body": {}, "auth": 'Bearer ' + accessToken });
						payload["credentials"]["tokenData"]["userId"] = payload.data.sub;
						return { isValid: true, credentials: { "accessToken": payload.credentials.accessToken, "tokenData": payload.credentials.tokenData } };
					} catch (e) {
						console.log("e.response.data.error === >", e.response.data);
						if (e.response.data.type == "SESSION_EXPIRED") {
							return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
						}
						if (e.response.data.type == "BAD_TOKEN") {
							return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
						}
					}
				}
			} catch (error) {
				logger.error(error);
				throw error;
			}
			},
		});

		async function handleRedisValidation(payload: any, request: Request) {
			let userData: any = await redisClient.getValue(`${payload.sub}.${payload.deviceId}`);
			userData = JSON.parse(userData);

			if (!userData) {
				userData = await handleUserDataRetrieval(payload);
			}

			return handleTokenValidation(userData, payload, request);
		}

		async function handleDefaultValidation(payload: any, request: Request) {
			const userData = await adminDaoV1.findUserById(payload.sub);
			if (!userData) {
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
			}

			return handleTokenValidation(userData, payload, request);
		}

		async function handleUserDataRetrieval(payload: any) {
			const userData = await adminDaoV1.findUserById(payload.sub);
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
				await adminControllerV1.removeSession(tokenData, true);
				return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BLOCKED));
			} else {
				return { isValid: true, credentials: { "accessToken": payload, "tokenData": tokenData } };
			}
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
			// accessTokenName: "accessToken",
			// tokenType: "Basic" || "Bearer" || "bearer",
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