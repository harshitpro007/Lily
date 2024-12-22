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
		INVALID_EVENT_TYPE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_EVENT_TYPE"
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
		SUBCRIPTION_PURCHASED: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "SUBCRIPTION_PURCHASED",
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

export const CARD_TYPE = {
    MASTER_CARD: "Master Card",
    VISA_CARD: "Visa Card",
    AMERICAN_EXPRESS: "American Express",
}

export const SUBSCRIPTION_STATUS = {
	ACTIVE: "ACTIVE",
	INACTIVE: "INACTIVE",
	PENDING: "PENDING",
	FAILED: "FAILED"
}

export const LANGUAGE = {
	ENGLISH: "en",
	SPANISH: "es"
}

export const CURRENCY = {
	USD: "usd"
}

export const INTERVAL = {
	DAY: "day",
	WEEK: "week",
	MONTH: "month",
	YEAR: "year"
}

export const MODE = {
	PAYMENT: "payment",
	SETUP: "setup",
	SUBSCRIPTION: "subscription"
}

export const PAYMENT_MODE_TYPES = {
	CARD: "card",
	ACH_DEBIT: "us_bank_account"
}

export const RESPONSE_ID = {
	SUCCESS: "?paymentStatus=c350b52b-571d-4cab-a918-4e8c3ac5e203",
	FAILED: "?paymentStatus=0f279acb-e144-4a82-bfe6-b67d07a579a0"
}

export const SUBSCRIPTION_INTERVAL = {
	MONTH: "month",
	YEAR: "year"
}

export const DASHBOARD_TYPE = {
	CLINIC: "CLINIC",
	PROVIDER: "PROVIDER",
	PATIENT: "PATIENT",
	SUBSCRIPTION: "SUBSCRIPTION"
}

export const STRIPE_WEBHOOKS = {
	SUCCESS: 'checkout.session.completed',
	FAILED: 'checkout.session.async_payment_failed',
	ACH_COMPLETED: 'checkout.session.async_payment_succeeded',
	CHARGE_SUCCEEDED: 'charge.succeeded'
}

export const MAIL_TYPE = {
	SUBSCRIPTION: "subscription"
}

export const PAYMENT_STATUS = {
	PAID: "paid"
}

export const ACH_DEBIT_CONFIG = {
	INSTANT: "instant",
	PAYMENT_METHOD: "payment_method"
}

export const NOTIFICATION_TYPE = {
	PURCHASE_SUBSCRIPTION: "PURCHASE_SUBSCRIPTION"
}