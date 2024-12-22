"use strict";
import { HTTP_STATUS_CODE } from "@config/main.constant";
export const MESSAGES = {
	ERROR: {
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"type": "INTERNAL_SERVER_ERROR"
		},
		BAD_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BAD_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "TOKEN_EXPIRED"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "BLOCKED"
		},
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
	},
	SUCCESS: {
		DEFAULT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "DEFAULT"
		},
		DETAILS: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEFAULT",
				"data": data
			};
		},
		LIST: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEFAULT",
				...data
			};
		},
		PROFILE: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "PROFILE",
				"data": data
			};
		},
		SUBSCRIPTION_LISTING: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "SUBSCRIPTION_LISTING",
				...data
			}
		},
		SUBSCRIPTION_DETAILS: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "SUBSCRIPTION_DETAILS",
				...data
			}
		},
		TRANSACTION_LISTING: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "TRANSACTION_LISTING",
				...data
			}
		}
	}
};

export const SUBSCRIPTION_TYPE = {
	MONTHLY: "Monthly",
	ANNUAL: "Annual",
	FREE: "Free"
}