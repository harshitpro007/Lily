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
		INVALID_ADMIN: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_ADMIN"
		},
        INVALID_PROVIDER: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_PROVIDER"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "BLOCKED"
		},
		SESSION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "SESSION_EXPIRED"
		},
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		CLINIC_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CLINIC_NOT_FOUND"
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
		MAIL_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MAIL_SENT"
		},
		PROFILE: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "PROFILE",
				"data": data
			};
		},
		TRANSACTION_ADDED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "TRANSACTION_ADDED"
		},
		TRANSACTION_LISTING: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "TRANSACTION_LISTING",
				"data": data
			}
		},
		AMOUNT_DATA: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "AMOUNT_DATA",
				"data": data
			}
		}
	}
};

export const SUBSCRIPTION_TYPE = {
	MONTHLY: "Monthly",
	ANNUAL: "Annual",
	FREE: "Free"
}

export const TRANSACTION_STATUS = {
	SUCCESS: "SUCCESS",
	FAILED: "FAILED",
	PENDING: "PENDING"
}

export const LANGUAGE = {
	ENGLISH: "en",
	SPANISH: "es"
}

export const LIMIT = {
	TRANSACTION_LIMIT: 10
}

export const monthNames = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];