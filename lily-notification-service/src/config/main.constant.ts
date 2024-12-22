import {
	SERVER_IS_IN_MAINTENANCE as EN_SERVER_IS_IN_MAINTENANCE,
	LINK_EXPIRED as EN_LINK_EXPIRED,
} from "../../locales/en.json";

const SWAGGER_DEFAULT_RESPONSE_MESSAGES = [
	{ code: 200, message: "OK" },
	{ code: 400, message: "Bad Request" },
	{ code: 401, message: "Unauthorized" },
	{ code: 404, message: "Data Not Found" },
	{ code: 500, message: "Internal Server Error" }
];

const HTTP_STATUS_CODE = {
	OK: 200,
	CREATED: 201,
	UPDATED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENY_REQUIRED: 402,
	ACCESS_FORBIDDEN: 403,
	FAV_USER_NOT_FOUND: 403,
	URL_NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	UNREGISTERED: 410,
	PAYLOAD_TOO_LARGE: 413,
	CONCURRENT_LIMITED_EXCEEDED: 429,
	// TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SHUTDOWN: 503,
	EMAIL_NOT_VERIFIED: 430,
	MOBILE_NOT_VERIFIED: 431,
	FRIEND_REQUEST_ERR: 432

};

const USER_TYPE = {
	ADMIN: "ADMIN",
	SUB_ADMIN: "SUB_ADMIN",
	USER: "USER",
	SUPPORTER: "SUPPORTER",
	PARTICIPANT: "PARTICIPANT"

};

const LOGIN_TYPE = {
	FACEBOOK: "facebook",
	GOOGLE: "google",
	NORMAL: "normal",
	APPLE: 'apple'
};

const DB_MODEL_REF = {
	LOGIN_HISTORY: "login_histories",
	// USER: "users",
	PRESIGNUP: "pre_signup",
	TOKEN:"tokens",
	ADMIN: "admins",
	NOTIFICATION_LIST: "notification_lists",

};

const VERIFICATION_LINK_TYPE = {
	FORGOT_PASSWORD: "FORGOT_PASSWORD",
	SIGN_UP: "SIGN_UP"
}

const DEVICE_TYPE = {
	ANDROID: "1",
	IOS: "2",
	WEB: "3",
	ALL: "4"
};

const PLATFORM = {
	ANDROID: "ANDROID",
	WEB: "WEB",
	IOS: "IOS"
}

const GENDER = {
	MALE: "MALE",
	FEMALE: "FEMALE",
	OTHER: "OTHER"
};

const STATUS = {
	BLOCKED: "BLOCKED",
	UN_BLOCKED: "UN_BLOCKED",
	ACTIVE: "ACTIVE",
	DELETED: "DELETED",
	UPCOMING: "UPCOMING",
	ONGOING: "ONGOING",
	ENDED: "ENDED",
	EXPIRED: "EXPIRED",
	INCOMPLETE: "INCOMPLETE",
	ACCEPTED: "ACCEPTED"
};

const VALIDATION_CRITERIA = {
	FIRST_NAME_MIN_LENGTH: 3,
	FIRST_NAME_MAX_LENGTH: 10,
	MIDDLE_NAME_MIN_LENGTH: 3,
	MIDDLE_NAME_MAX_LENGTH: 10,
	LAST_NAME_MIN_LENGTH: 3,
	LAST_NAME_MAX_LENGTH: 10,
	NAME_MIN_LENGTH: 3,
	COUNTRY_CODE_MIN_LENGTH: 1,
	COUNTRY_CODE_MAX_LENGTH: 4,
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 40,
	LATITUDE_MIN_VALUE: -90,
	LATITUDE_MAX_VALUE: 90,
	LONGITUDE_MIN_VALUE: -180,
	LONGITUDE_MAX_VALUE: 180
};


const VALIDATION_MESSAGE = {
	invalidId: {
		pattern: "Invalid Id."
	},
	mobileNo: {
		pattern: "Please enter a valid mobile number."
	},
	email: {
		pattern: "Please enter email address in a valid format."
	},
	password: {
		required: "Please enter password.",
		pattern: "Please enter a valid password.",
		// pattern: `Please enter a proper password with minimum ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH} character, which can be alphanumeric with special character allowed.`,
		minlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`,
		// maxlength: `Please enter a proper password with minimum ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH} character, which can be alphanumeric with special character allowed.`
		maxlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`
	}
};

const MESSAGES = {
	ERROR: {
		DECRYPTION_ERROR: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "DECRYPTION_ERROR"
		},
		PAYLOAD_ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "PAYLOAD_ERROR"
			};
		},
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"type": "INTERNAL_SERVER_ERROR"
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OLD_PASSWORD"
		},
		BAD_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BAD_TOKEN"
		},
		INVALID_MAIL_TYPE:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_MAIL_TYPE"
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
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		SOMETHING_WENT_WRONG: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "SOMETHING_WENT_WRONG"
		},
		SERVER_IS_IN_MAINTENANCE: () => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": EN_SERVER_IS_IN_MAINTENANCE,
				"type": "SERVER_IS_IN_MAINTENANCE"
			};
		},
		LINK_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": EN_LINK_EXPIRED,
			"type": "LINK_EXPIRED"
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
		MAIL_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MAIL_SENT"
		},
		MESSAGE_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MESSAGE_SENT"
		},
		CHANGE_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "CHANGE_PASSWORD"
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

const TEMPLATES = {
	EMAIL: {
		SUBJECT: {
			FORGOT_PASSWORD: "Password Reset Request for LilyLink",
			// RESET_PASSWORD: "Reset password link",
			VERIFY_EMAIL: "Verify email address",
			WELCOME: " Gestational Diabetes Management with LilyLink – You’ve Been Invited by",
			NEW_PASSWORD: "Your New Password",
			VERIFICATION_REJECTED: "Verification Process Rejected",
			UPLOAD_DOCUMENT: "Upload Document",
			INCIDENT_REPORT: "Incident Report",
			ADD_NEW_PROVIDER: "Welcome to LilyLink – Your Partner in Gestational Diabetes Care",
			CLINIC_NEW_PROVIDER: "Welcome to LilyLink at",
			GLUCOSE_DATA: "Glucose Data",
			ACCOUNT_DEACTIVATED: "Account Deactivated",
			ACCOUNT_ACTIVATED: "Account Activated",
			SUBSCRIPTION: "Payment Received!",
			SUPPORT: "Support Ticket",
			CLOSE_TICKET: "Ticket Closed",
			EMAIL_NOTIFICATION: "Lily"
		},
		FROM_MAIL: process.env["SENDGRID_FROM_MAIL"],
		BCC: "bcc",
		ATTCHMENTS: "attachments"
	},
	SMS: {
		OTP: `Your Lily Code is .`,
		THANKS: `Thanks, Lily Team`
	}
};

const FIREBASE_TOKEN = {
	FIREBASE_ACCOUNT_KEY: "",//process.env["FIREBASE_ACCOUNT_KEY"],
	FIREBASE_DATABASE_URL: ""// process.env["DB_URL"]
}

const REGEX = {
	EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
	SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
	ZIP_CODE: /^\d{5}(-\d{4})?$/,
	PASSWORD: /^[A-Za-z][A-Za-z\d@#$%^&+]{7,15}$/, // password is between 8 and 16 characters long and includes at least one uppercase letter, one lowercase letter, one digit, and one special character
	PASSWORD_V2: /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=(.*[\d@#$%^&+=])).{8,16}$/, // checks for at least one uppercase letter, at least one lowercase letter, and then either at least one digit or one special character
	PASSWORD_V3: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]\\|;:'",.<>?/])(?!.*[a-z]).{8,16}$/, // checks for atleast one uppercase, one special & one number
	COUNTRY_CODE: /^\d{1,4}$/,
	MOBILE_NUMBER: /^\d{6,15}$/,
	STRING_REPLACE: /[-+ ()*_$#@!{}|/^%`~=?,.<>:;'"]/g,
	SEARCH: /[-[\]/{}()*+?.\\^$|]/g,
	MONGO_ID: /^[a-f\d]{24}$/i,
	NAME: /^[a-zA-Z ]{2,50}$/
};

const VERSION_UPDATE_TYPE = {
	NORMAL: "NORMAL", // skippable
	FORCEFULLY: "FORCEFULLY"
};

const JOB_SCHEDULER_TYPE = {
	ACTIVITY_BOOKING: "activity_booking",
	START_GROUP_ACTIVITY: "start_group_activity",
	FINISH_GROUP_ACTIVITY: "finish_group_activity",
	EXPIRE_GROUP_ACTIVITY: "expire_group_activity",
	EXPIRE_SHIFT_ACTIVITY: "expire_shift_activity",
	EXPIRE_SHIFT_START_TIME: "expire_shift_activity_start_time",
	SHIFT_NOTIFICATION_INTERVAL: "shift_notification_interval",
	GROUP_NOTIFICATION_INTERVAL: "group_notification_interval",
	EXPIRE_GROUP_START_TIME: "expire_group_activity_start_time",
	AUTO_SESSION_EXPIRE: "auto_session_expire",
	TEMPORARY_ACCOUNT_BLOCKED: "temporary_account_blocked"
};
const LANGUAGES = [{
	"code": "en",
	"id": 38,
	"isSelected": false,
	"name": "English"
}];

const LANGUAGE = {
	"English": "en",
	"Arabic": "ar"
}

const TOKEN_TYPE = {
	USER_LOGIN: "USER_LOGIN", // login/signup
	ADMIN_LOGIN: "ADMIN_LOGIN",
	ADMIN_OTP_VERIFY: "ADMIN_OTP_VERIFY",
	SIGN_UP: "SIGN_UP",
	FORGOT_PASSWORD: "FORGOT_PASSWORD"
};

const timeZones = [
	"Asia/Kolkata"
];

const UPDATE_TYPE = {
	BLOCK_UNBLOCK: "BLOCK_UNBLOCK",
	APPROVED_DECLINED: "APPROVED_DECLINED",
	ABOUT_ME: "ABOUT_ME",
	EDIT_PROFILE: "EDIT_PROFILE",
	SET_PROFILE_PIC: "SET_PROFILE_PIC"
};

const fileUploadExts = [
	".mp4", ".flv", ".mov", ".avi", ".wmv",
	".jpg", ".jpeg", ".png", ".gif", ".svg",
	".mp3", ".aac", ".aiff", ".m4a", ".ogg"
];

const MAIL_TYPE = {
	FORGOT_PASSWORD_LINK: "forgot-password-link",
	CREATE_PROVIDER: "create-provider",
	VERIFY_EMAIL: "verify-email",
	FORGOT_PASSWORD: "forgot-password",
	WELCOME_MAIL: "welcome-mail",
	CONTACT_US: "contact-us",
	RESET_PASSWORD: "reset-password",
	ADD_PROVIDER: "add-provider",
	GLUCOSE_DATA: "glucose_data",
	ACCOUNT_DEACTIVATE: "deactivate_account",
	ACCOUNT_ACTIVATE: "activate_account",
	SUBSCRIPTION: "subscription",
	CLOSE_TICKET: "close_ticket",
	EMAIL_NOTIFICATION: "email_notification"
}

const NOTIFICATION_TITLE = {
	UPDATE_PROVIDER: "Details Updated!",
	ADD_PROVIDER: "New Provider Added",
	ADD_RPM: "New RPM Visit Added",
	UPDATE_PAITENT: "Details Updated",
	PURCHASE_SUBSCRIPTION: "Subscription Activated!",
	SUPPORT_TICKET: "Support Ticket"
}

const NOTIFICATION_MSG = {
	UPDATE_PROVIDER: "Your account have been updated by the Admin",
	ADD_PROVIDER: "has been added by the",
	ADD_RPM: "New RPM visit has been added for the",
	UPDATE_PAITENT: "Your account have been updated by the",
	PURCHASE_SUBSCRIPTION: "Your subscription has been activated.",
	SUPPORT_TICKET: "ticket has been successfully closed"
}

const NOTIFICATION = (type,data?) =>{
	switch (type) {
		case 'ADMIN_NOTIFICATION':
            return {
                "body": data?.details.description,
                "title": data?.details.title,
                "message": data?.details.description,
            };
        case "UPDATE_PROVIDER":
			return {
				title: NOTIFICATION_TITLE.UPDATE_PROVIDER,
				message: NOTIFICATION_MSG.UPDATE_PROVIDER,
				body: NOTIFICATION_MSG.UPDATE_PROVIDER,
				"details": data?.details ? data.details : {}
			};
		case "ADD_PROVIDER":
			return {
				title: NOTIFICATION_TITLE.ADD_PROVIDER,
				message: `new ${data?.details.roleType} ${NOTIFICATION_MSG.ADD_PROVIDER} ${data?.details.name}.`,
				body: `new ${data?.details.roleType} ${NOTIFICATION_MSG.ADD_PROVIDER} ${data?.details.name}.`,
				"details": data?.details ? data.details : {}
			}
		case "ADD_RPM":
			return {
				title: NOTIFICATION_TITLE.ADD_RPM,
				message: `${NOTIFICATION_MSG.ADD_RPM} ${data?.details.name} by the ${data?.details.providerName}`,
				body: `${NOTIFICATION_MSG.ADD_RPM} ${data?.details.name} by the ${data?.details.providerName}`,
				"details": data?.details ? data.details : {}
			}
		case "CLOSE_TICKET":
			return {
				title: NOTIFICATION_TITLE.SUPPORT_TICKET,
				message: `${data?.details.requestNo} ${NOTIFICATION_MSG.SUPPORT_TICKET}`,
				body: `${data?.details.requestNo} ${NOTIFICATION_MSG.SUPPORT_TICKET}`,
				"details": data?.details ? data.details : {}
			}	
		case "UPDATE_PAITENT":
			return {
				title: NOTIFICATION_TITLE.UPDATE_PAITENT,
				message: NOTIFICATION_MSG.UPDATE_PAITENT + " " + data?.details.name,
				body: NOTIFICATION_MSG.UPDATE_PAITENT + " " + data?.details.name,
				"details": data?.details ? data.details : {}
			}
		case "PURCHASE_SUBSCRIPTION":
			return {
				title: NOTIFICATION_TITLE.PURCHASE_SUBSCRIPTION,
				message: NOTIFICATION_MSG.PURCHASE_SUBSCRIPTION,
				body: NOTIFICATION_MSG.PURCHASE_SUBSCRIPTION,
				"details": data?.details ? data.details : {}
			}
        default:
            return null;
    }
}

const ENVIRONMENT = {
	PRODUCTION: "production",
	PREPROD: "preprod",
	QA: "qa",
	DEV: "dev",
	LOCAL: "local",
	STAGING: "staging"
};

const TIMERS = {
	ZERO: 0,
	HALF_SECOND: 500,
	SECOND: 1000,
	TWO_SECOND: 2000
};

const FIREBASE = {
	SOUND: "default",
	HIGH_PRIORITY: "high",
	APNS_PRIORITY: "10",
	APNS_EXPIRATION: "0"
}


export {
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	HTTP_STATUS_CODE,
	USER_TYPE,
	DB_MODEL_REF,
	DEVICE_TYPE,
	GENDER,
	STATUS,
	VALIDATION_CRITERIA,
	VALIDATION_MESSAGE,
	MESSAGES,
	REGEX,
	TEMPLATES,
	JOB_SCHEDULER_TYPE,
	LANGUAGES,
	LANGUAGE,
	TOKEN_TYPE,
	timeZones,
	UPDATE_TYPE,
	fileUploadExts,
	FIREBASE_TOKEN,
	LOGIN_TYPE,
	VERIFICATION_LINK_TYPE,
	MAIL_TYPE,
	ENVIRONMENT,
	NOTIFICATION,
	NOTIFICATION_TITLE,
	NOTIFICATION_MSG,
	PLATFORM,
	TIMERS,
	FIREBASE
};