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
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "TOKEN_GENERATE_ERROR"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "BLOCKED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "INCORRECT_PASSWORD"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BLOCKED_MOBILE"
		},
		SESSION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "SESSION_EXPIRED"
		},
		FAV_USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.FAV_USER_NOT_FOUND,
			"type": "FAV_NOT_FOUND"
		},
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		FRIEND_ERROR: (value, code = HTTP_STATUS_CODE.FRIEND_REQUEST_ERR) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_NOT_REGISTERED"
		},
		EMAIL_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_ALREADY_EXIST"
		},
		EMAIL_NOT_VERIFIED: (code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"type": "EMAIL_NOT_VERIFIED"
			}
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OLD_PASSWORD"
		},
		NEW_CONFIRM_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "NEW_CONFIRM_PASSWORD"
		},
		OTP_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "OTP_EXPIRED"
		},
		INVALID_OTP: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OTP"
		},
		EXCEED_MAX_LOGINS:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EXCEED_MAX_LOGINS"
		},
		EXCEED_OTP_LIMIT:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EXCEED_OTP_LIMIT"
		},
		// user specific
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_NOT_FOUND"
		},
		PROFILE_NOT_COMPLETED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "PROFILE_NOT_COMPLETED"
		},
		USER_DOES_NOT_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_DOES_NOT_EXIST"
		},
		DOCUMENT_NOT_APPROVED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "DOCUMENT_NOT_APPROVED"
		},
		EMAIL_REQUIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_REQUIRED"
		},
		MOBILE_NO_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.MOBILE_NOT_VERIFIED,
			"type": "MOBILE_NO_NOT_VERIFIED"
		},
		MOBILE_NO_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MOBILE_NO_ALREADY_EXIST"
		},
		SAME_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "SAME_PASSWORD"
		},
		EMPTY_NAME: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMPTY_NAME"
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
		LIST: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEFAULT",
				...data
			};
		},
		SEND_OTP: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "SEND_OTP"
		},
		MAIL_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MAIL_SENT"
		},
		VERIFY_OTP: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "VERIFY_OTP",
				"data": data
			};
		},
		PROFILE: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "PROFILE",
				"data": data
			};
		},
		RESET_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "RESET_PASSWORD"
		},
		MAKE_PUBLIC_SHIFT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MAKE_PUBLIC_SHIFT"
		},
		CHANGE_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "CHANGE_PASSWORD"
		},
		EDIT_PROFILE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_PROFILE"
		},
		// admin specific
		ADMIN_LOGIN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "ADMIN_LOGIN",
				"data": data
			};
		},
		LOGOUT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "LOGOUT"
		},
		// notification specific
		NOTIFICATION_DELETED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "NOTIFICATION_DELETED"
		},
		
		// user specific
		SIGNUP: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.CREATED,
				"type": "SIGNUP",
				"data": data
			};
		},
		LOGIN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "LOGIN",
				"data": data
			};
		},
		USER_LOGOUT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "USER_LOGOUT"
		},
		BLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "BLOCK_USER"
		},
		UNBLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UNBLOCK_USER"
		},
		
		
	}

};

export const DEVICE = {
	DEXCOM_G7: "Dexcom G7",
	LIBRA_3: "FreeStyle Libre",
	ACCUCHEK: "Accuchek",
	NA: "N/A"
}
