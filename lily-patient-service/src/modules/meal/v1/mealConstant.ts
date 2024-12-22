"use strict";
import { HTTP_STATUS_CODE } from "@config/main.constant";
export const MESSAGES = {
	ERROR: {
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "BLOCKED"
		},
		// user specific
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_NOT_FOUND"
		},
		USER_DOES_NOT_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_DOES_NOT_EXIST"
		},
		MEAL_ALREADY_ADDED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEAL_ALREADY_ADDED"
		},
		MEAL_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEAL_NOT_FOUND"
		},
		MEAL_NOT_EDITABLE:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEAL_NOT_EDITABLE"
		},
		INVALID_DAYS: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_DAYS"
		},
		ACCOUNT_BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "ACCOUNT_BLOCKED"
		}
	},
	SUCCESS: {
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
		DEVICE_HISTORY: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEVICE_HISTORY",
				"data": data
			}
		},
		MEAL_ADDED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MEAL_ADDED"
		},
		EDIT_MEAL: (data) => {
			return{
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "EDIT_MEAL",
				"data": data
			}
		},
		GLUCOSE_ADDED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "GLUCOSE_ADDED"
		},
		MEAL_DETAILS: (data) => {
			return{
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "MEAL_DETAILS",
				"data": data
			}
		},
		GLUCOSE_AVERAGES: (data) => {
			return{
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "GLUCOSE_AVERAGES",
				"data": data
			}
		},
		GLUCOSE_LOGS: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "GLUCOSE_LOGS"
		},
		EDIT_GLUCOSE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_GLUCOSE"
		},
		DEVICE_DATA_ADDED: (data) => {
			return{
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEVICE_DATA_ADDED",
				"data": data
			}
		}
	}

};

export const MEAL_CATEGORY = {
	FASTING: "Fasting",
	BREAKFAST: "Breakfast",
	LUNCH: "Lunch",
	DINNER: "Dinner",
}

export const UNIT = {
	GLUCOSE_UNIT: "mg/dL"
}

export const LANGUAGE = {
	ENGLISH: "en",
	SPANISH: "es"
}

export const RANGE = {
	LOW : 60,
	HIGH: 140,
	FASTING_HIGH: 95,
	OTHER_HIGH: 120
}

export const STATUS = {
	YES: "YES",
	NO: "NO"
}

export const LOGS_DAYS = {
	ONE_WEEK: "ONE_WEEK",
	TWO_WEEKS: "TWO_WEEKS",
	ONE_MONTH: "ONE_MONTH",
	ALL_TIME: "ALL_TIME"
}

export const AVERAGE_TYPE = {
	AVERAGES: "Averages",
	GRAPH: "Graph"
}

export const DAYS = {
	THREE_DAYS: "THREE_DAYS",
	ONE_WEEKS: "ONE_WEEKS",
	TWO_WEEKS: "TWO_WEEKS",
	ONE_MONTH: "ONE_MONTH",
	ALL_TIME: "ALL_TIME"
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