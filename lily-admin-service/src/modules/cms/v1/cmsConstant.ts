"use strict";
import { HTTP_STATUS_CODE } from "@config/main.constant";
export const MESSAGES = {
	ERROR: {
		INVALID_FAQ: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_FAQ"
		},
		INVALID: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID"
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
		}
	}
};

export const CmsType = {
	TERMSANDCONDITIONS: "TERMSANDCONDITIONS",
	PRIVACYPOLICY: "PRIVACYPOLICY"	
}