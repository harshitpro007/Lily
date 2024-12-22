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
		INVALID_REFRESH_TOKEN: {
			statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      		type: "INVALID_REFRESH_TOKEN",
		},
		INVALID_INVITATION: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_INVITATION"
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
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INCORRECT_PASSWORD"
		},
		CODE_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CODE_NOT_FOUND"
		},
		USER_ALREADY_INACTIVE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_ALREADY_INACTIVE"
		},
		INCORRECT_DOB:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INCORRECT_DOB"
		},
		CANT_EDIT_DUEDATE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CANT_EDIT_DUEDATE"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "BLOCKED_MOBILE"
		},
		LIMIT_EXCEEDS: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "LIMIT_EXCEEDS"
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
		USER_ALREADY_EXIST:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_ALREADY_EXIST"
		},
		EMAIL_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED,
			"type": "EMAIL_NOT_VERIFIED"
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
		},
		INVALID_ADMIN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "INVALID_ADMIN"
		},
		INVALID_USER: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "INVALID_USER"
		},
		PASSWORD_DOESNT_MATCH: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "PASSWORD_DOESNT_MATCH"
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
		EDIT_PROFILE: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "EDIT_PROFILE",
				"data": data
			}
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
		ACCOUNT_DELETED:{
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "ACCOUNT_DELETED"
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
		INVITE_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "INVITE_SENT"
		},
		UNBLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UNBLOCK_USER"
		},
		PATIENT_CREATED: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "PATIENT_CREATED"
		},
		CONTACT_US:{
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "CONTACT_US"
		},
		NOTIFCATION_COUNT: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "NOTIFCATION_COUNT",
				"data": data
			}
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

export const DISPLAY_PATIENT_TYPES = {
	T1: "Type 1",
	T2: "Type 2",
	GDM: "GDM",
	NA: "N/A"
}

export const MANAGEMENT = {
	DIET: "DIET",
	MED: "MED"
}

export const DEVICE = {
	DEXCOM_G7: "Dexcom G7",
	LIBRA_3: "FreeStyle Libre",
	ACCUCHEK: "Accuchek",
	NA: "N/A"
}

export const OTP_TYPE = {
	VERIFY_MAIL: "VERIFY_MAIL",
	FORGOT_PASSWORD: "FORGOT_PASSWORD",
	VERIFY_MOBILE_NO: "VERIFY_MOBILE_NO"
}

export const MAIL_TYPE = {
	FORGOT_PASSWORD_LINK: "forgot-password-link",
	CREATE_PROVIDER: "create-provider",
	VERIFY_EMAIL: "verify-email",
	FORGOT_PASSWORD: "forgot-password",
	WELCOME_MAIL: "welcome-mail",
	CONTACT_US: "contact-us",
	RESET_PASSWORD: "reset-password",
	GLUCOSE_DATA: "glucose_data",
	ACCOUNT_DEACTIVATE: "deactivate_account",
	ACCOUNT_ACTIVATE: "activate_account"
}

export const DASHBOARD_TYPE = {
	CLINIC: "CLINIC",
	PROVIDER: "PROVIDER",
	PATIENT: "PATIENT"
}

export const PATIENT_GEST_STATUS = {
	DELIVERED: "Delivered"
}

export const NOTIFICATION_TYPE = {
	UPDATE_PROVIDER: "UPDATE_PROVIDER",
	ADD_PROVIDER: "ADD_PROVIDER",
	ADD_RPM: "ADD_RPM",
	UPDATE_PAITENT: "UPDATE_PAITENT",
	ADMIN_NOTIFICATION: "ADMIN_NOTIFICATION"
}

export const GLUCOSE_INTERVAL = {
	ONE: 1,
	TWO: 2
}

export const CRONE_TYPE = {
	CHECK_DELIVERED: "CHECK_DELIVERED",
	ADD_MEAL_DATA: "ADD_MEAL_DATA",
	UPDATE_GRAPH_LAST_INTERVAL: "UPDATE_GRAPH_LAST_INTERVAL",
	LIBRE_DEVICE_DATA: "LIBRE_DEVICE_DATA",
	DEXCOM_DEVICE_DATA: "DEXCOM_DEVICE_DATA",
	ADD_FASTING_DATA: "ADD_FASTING_DATA"
}