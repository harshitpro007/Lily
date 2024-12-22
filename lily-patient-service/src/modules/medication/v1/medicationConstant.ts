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
		MEDICATION_ALREADY_ADDED:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEDICATION_ALREADY_ADDED"
		},
		MEDICATION_NOT_FOUND:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEDICATION_NOT_FOUND"
		},
		MEDICATION_NOT_EDITABLE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MEDICATION_NOT_EDITABLE"
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
		MEDICATION_ADDED:{
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MEDICATION_ADDED"
		},
		EDIT_MEDICATION: (data) => {
			return{
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "EDIT_MEDICATION",
				"data": data
			}
		}
	}

};

export const MEDICATION_TYPE = {
    INSULIN: "Insulin",
    ORAL: "Oral"
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

export const GLUCOSE_PRANDIAL = {
	ONE: 1,
	TWO: 2,
	PEAK_VALUE: 3
}