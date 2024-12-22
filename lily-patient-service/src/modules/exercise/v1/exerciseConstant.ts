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
		EXERCISE_ADDED:{
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EXERCISE_ADDED"
		},
		HEALTH_ADDED:{
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "HEALTH_ADDED"
		},
	}

};

export const EXERCISE_CATEGORY = {
	EXERCISE: "EXERCISE",
	HEALTH: "HEALTH"
}

export const EXERCISE_TYPE = {
	WALKING: "WALKING",
	CYCLING: "CYCLING",
	YOGA: "YOGA",
	SWIMMING: "SWIMMING"
}

export const EXERCISE_INTENSITY = {
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH"
}

export const LANGUAGE = {
	ENGLISH: "en",
	SPANISH: "es"
}

export const RANGE = {
	LOW : 80,
	HIGH: 120
}
