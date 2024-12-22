"use strict";
import { HTTP_STATUS_CODE } from "@config/main.constant";
export const MESSAGES = {
	ERROR: {
		INVALID_NOTIFI_ID: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_NOTIFI_ID"
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
		NOTIFICATION_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "NOTIFICATION_SENT"
		}
	}
};

export const USERS={
	ALL: "ALL",
	PATIENTS: "PATIENTS",
	CLINIC: "CLINIC"
}

export const PLATFORM_TYPE = {
	ANDROID: "ANDROID",
	IOS: "IOS",
	WEB: "WEB",
	ALL: "ALL"
};