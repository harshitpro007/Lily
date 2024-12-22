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
		INVALID_DATE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_DATE"
		},
		ACCOUNT_BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "ACCOUNT_BLOCKED"
		}
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
		PATIENT_EDIT: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "PATIENT_EDIT",
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
		SUBCRIPTION_PURCHASED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "SUBCRIPTION_PURCHASED"
		},
		RPM_VISIT_ADDED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "RPM_VISIT_ADDED"
		},
		EDIT_RPM_VIST: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_RPM_VIST"
		}
	}
};


export const LANGUAGE = {
	ENGLISH: "en",
	SPANISH: "es"
}

export const PATIENT_TYPE = {
	T1: "T1",
	T2: "T2",
	GDM: "GDM",
	NA: "N/A"
}

export const DEVICE = {
	DEXCOM_G7: "Dexcom G7",
	LIBRA_3: "FreeStyle Libre",
	NA: "N/A"
}

export const COMMUNICATION_MODE = {
	AUDIO: "Audio",
	VIDEO: "Video"
}

export const MEAL_CATEGORY = {
	FASTING: "Fasting",
	BREAKFAST: "Breakfast",
	LUNCH: "Lunch",
	DINNER: "Dinner",
}

export const LOGS_DAYS = {
	ONE_WEEK: "ONE_WEEK",
	TWO_WEEKS: "TWO_WEEKS",
	ONE_MONTH: "ONE_MONTH",
	ALL_TIME: "ALL_TIME"
}

export const GLUCOSE_INTERVAL = {
	ONE: 1,
	TWO: 2
}

export const GLUCOSE_PRANDIAL = {
	ONE: 1,
	TWO: 2,
	PEAK_VALUE: 3 
}

export const RPM_TYPE = {
	TRAINING: "Training",
	RPM: "RPM"
}