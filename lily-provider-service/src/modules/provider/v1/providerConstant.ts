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
		INVALID_USER: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_USER"
		},
		BAD_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BAD_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "TOKEN_GENERATE_ERROR"
		},
		INVALID_INVITATION: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_INVITATION"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "BLOCKED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INCORRECT_PASSWORD"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "BLOCKED_MOBILE"
		},
		CLINIC_NOT_FOUND:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CLINIC_NOT_FOUND"
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
		NPI_ALREADY_EXIST:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "NPI_ALREADY_EXIST"
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OLD_PASSWORD"
		},
		NEW_CONFIRM_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "NEW_CONFIRM_PASSWORD"
		},
		PASSWORD_DOESNT_MATCH: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "PASSWORD_DOESNT_MATCH"
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
		LIMIT_EXCEEDS: {
			statusCode: HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			type: "LIMIT_EXCEEDS",
		},
		ZIP_CODE_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "ZIP_CODE_NOT_FOUND"
		},
		MAIN_PROVIDER_ALREADY_EXISTS:{
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MAIN_PROVIDER_ALREADY_EXISTS"
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
		VALID_TOKEN:{
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "VALID_TOKEN"
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
		PROVIDER_CREATED: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "PROVIDER_CREATED"
		},
		PATIENT_CREATED: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "PATIENT_CREATED"
		},
		INVITE_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "INVITE_SENT"
		},
		EDIT_CLINIC: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_CLINIC"
		},
		NOTIFCATION_COUNT: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "NOTIFCATION_COUNT",
				"data": data
			}
		},
		CLINIC_CREATED: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "CLINIC_CREATED"
		}
	}
};

export const SUBSCRIPTION_TYPE = {
	MONTHLY: "Monthly",
	ANNUAL: "Annual",
	FREE: "Free"
}

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

export const MANAGEMENT = {
	DIET: "DIET",
	MED: "MED"
}

export const DEVICE = {
	DEXCOM_G7: "Dexcom G7",
	LIBRA_3: "FreeStyle Libre",
	NA: "N/A"
}

export const MAIL_TYPE = {
	FORGOT_PASSWORD_LINK: "forgot-password-link",
	CREATE_PROVIDER: "create-provider",
	ADD_PROVIDER: "add-provider",
	ACCOUNT_DEACTIVATE: "deactivate_account",
	ACCOUNT_ACTIVATE: "activate_account"
}

export const COUNTRY_CODES = {
	"AF": "Afghanistan",
	"AX": "Åland Islands",
	"AL": "Albania",
	"DZ": "Algeria",
	"AS": "American Samoa",
	"AD": "Andorra",
	"AO": "Angola",
	"AI": "Anguilla",
	"AQ": "Antarctica",
	"AG": "Antigua and Barbuda",
	"AR": "Argentina",
	"AM": "Armenia",
	"AW": "Aruba",
	"AU": "Australia",
	"AT": "Austria",
	"AZ": "Azerbaijan",
	"BS": "Bahamas",
	"BH": "Bahrain",
	"BD": "Bangladesh",
	"BB": "Barbados",
	"BY": "Belarus",
	"BE": "Belgium",
	"BZ": "Belize",
	"BJ": "Benin",
	"BM": "Bermuda",
	"BT": "Bhutan",
	"BO": "Bolivia, Plurinational State of bolivia",
	"BA": "Bosnia and Herzegovina",
	"BW": "Botswana",
	"BV": "Bouvet Island",
	"BR": "Brazil",
	"IO": "British Indian Ocean Territory",
	"BN": "Brunei Darussalam",
	"BG": "Bulgaria",
	"BF": "Burkina Faso",
	"BI": "Burundi",
	"KH": "Cambodia",
	"CM": "Cameroon",
	"CA": "Canada",
	"CV": "Cape Verde",
	"KY": "Cayman Islands",
	"CF": "Central African Republic",
	"TD": "Chad",
	"CL": "Chile",
	"CN": "China",
	"CX": "Christmas Island",
	"CC": "Cocos (Keeling) Islands",
	"CO": "Colombia",
	"KM": "Comoros",
	"CG": "Congo",
	"CD": "Congo, The Democratic Republic of the Congo",
	"CK": "Cook Islands",
	"CR": "Costa Rica",
	"CI": "Cote d'Ivoire",
	"HR": "Croatia",
	"CU": "Cuba",
	"CY": "Cyprus",
	"CZ": "Czech Republic",
	"DK": "Denmark",
	"DJ": "Djibouti",
	"DM": "Dominica",
	"DO": "Dominican Republic",
	"EC": "Ecuador",
	"EG": "Egypt",
	"SV": "El Salvador",
	"GQ": "Equatorial Guinea",
	"ER": "Eritrea",
	"EE": "Estonia",
	"ET": "Ethiopia",
	"FK": "Falkland Islands (Malvinas)",
	"FO": "Faroe Islands",
	"FJ": "Fiji",
	"FI": "Finland",
	"FR": "France",
	"GF": "French Guiana",
	"PF": "French Polynesia",
	"TF": "French Southern Territories",
	"GA": "Gabon",
	"GM": "Gambia",
	"GE": "Georgia",
	"DE": "Germany",
	"GH": "Ghana",
	"GI": "Gibraltar",
	"GR": "Greece",
	"GL": "Greenland",
	"GD": "Grenada",
	"GP": "Guadeloupe",
	"GU": "Guam",
	"GT": "Guatemala",
	"GG": "Guernsey",
	"GN": "Guinea",
	"GW": "Guinea-Bissau",
	"GY": "Guyana",
	"HT": "Haiti",
	"HM": "Heard Island and Mcdonald Islands",
	"VA": "Holy See (Vatican City State)",
	"HN": "Honduras",
	"HK": "Hong Kong",
	"HU": "Hungary",
	"IS": "Iceland",
	"IN": "India",
	"ID": "Indonesia",
	"IR": "Iran, Islamic Republic of Persian Gulf",
	"IQ": "Iraq",
	"IE": "Ireland",
	"IM": "Isle of Man",
	"IL": "Israel",
	"IT": "Italy",
	"JM": "Jamaica",
	"JP": "Japan",
	"JE": "Jersey",
	"JO": "Jordan",
	"KZ": "Kazakhstan",
	"KE": "Kenya",
	"KI": "Kiribati",
	"KP": "Korea, Democratic People's Republic of Korea",
	"KR": "Korea, Republic of South Korea",
	"XK": "Kosovo",
	"KW": "Kuwait",
	"KG": "Kyrgyzstan",
	"LA": "Laos",
	"LV": "Latvia",
	"LB": "Lebanon",
	"LS": "Lesotho",
	"LR": "Liberia",
	"LY": "Libyan Arab Jamahiriya",
	"LI": "Liechtenstein",
	"LT": "Lithuania",
	"LU": "Luxembourg",
	"MO": "Macao",
	"MK": "Macedonia",
	"MG": "Madagascar",
	"MW": "Malawi",
	"MY": "Malaysia",
	"MV": "Maldives",
	"ML": "Mali",
	"MT": "Malta",
	"MH": "Marshall Islands",
	"MQ": "Martinique",
	"MR": "Mauritania",
	"MU": "Mauritius",
	"YT": "Mayotte",
	"MX": "Mexico",
	"FM": "Micronesia, Federated States of Micronesia",
	"MD": "Moldova",
	"MC": "Monaco",
	"MN": "Mongolia",
	"ME": "Montenegro",
	"MS": "Montserrat",
	"MA": "Morocco",
	"MZ": "Mozambique",
	"MM": "Myanmar",
	"NA": "Namibia",
	"NR": "Nauru",
	"NP": "Nepal",
	"NL": "Netherlands",
	"AN": "Netherlands Antilles",
	"NC": "New Caledonia",
	"NZ": "New Zealand",
	"NI": "Nicaragua",
	"NE": "Niger",
	"NG": "Nigeria",
	"NU": "Niue",
	"NF": "Norfolk Island",
	"MP": "Northern Mariana Islands",
	"NO": "Norway",
	"OM": "Oman",
	"PK": "Pakistan",
	"PW": "Palau",
	"PS": "Palestinian Territory, Occupied",
	"PA": "Panama",
	"PG": "Papua New Guinea",
	"PY": "Paraguay",
	"PE": "Peru",
	"PH": "Philippines",
	"PN": "Pitcairn",
	"PL": "Poland",
	"PT": "Portugal",
	"PR": "Puerto Rico",
	"QA": "Qatar",
	"RO": "Romania",
	"RU": "Russia",
	"RW": "Rwanda",
	"RE": "Reunion",
	"BL": "Saint Barthelemy",
	"SH": "Saint Helena, Ascension and Tristan Da Cunha",
	"KN": "Saint Kitts and Nevis",
	"LC": "Saint Lucia",
	"MF": "Saint Martin",
	"PM": "Saint Pierre and Miquelon",
	"VC": "Saint Vincent and the Grenadines",
	"WS": "Samoa",
	"SM": "San Marino",
	"ST": "Sao Tome and Principe",
	"SA": "Saudi Arabia",
	"SN": "Senegal",
	"RS": "Serbia",
	"SC": "Seychelles",
	"SL": "Sierra Leone",
	"SG": "Singapore",
	"SK": "Slovakia",
	"SI": "Slovenia", "SB": "Solomon Islands",
	"SO": "Somalia",
	"ZA": "South Africa",
	"SS": "South Sudan",
	"GS": "South Georgia and the South Sandwich Islands",
	"ES": "Spain",
	"LK": "Sri Lanka",
	"SD": "Sudan",
	"SR": "Suriname",
	"SJ": "Svalbard and Jan Mayen",
	"SZ": "Eswatini",
	"SE": "Sweden",
	"CH": "Switzerland",
	"SY": "Syrian Arab Republic",
	"TW": "Taiwan",
	"TJ": "Tajikistan",
	"TZ": "Tanzania, United Republic of Tanzania",
	"TH": "Thailand",
	"TL": "Timor-Leste",
	"TG": "Togo",
	"TK": "Tokelau",
	"TO": "Tonga",
	"TT": "Trinidad and Tobago",
	"TN": "Tunisia",
	"TR": "Turkey",
	"TM": "Turkmenistan",
	"TC": "Turks and Caicos Islands",
	"TV": "Tuvalu",
	"UG": "Uganda",
	"UA": "Ukraine",
	"AE": "United Arab Emirates",
	"GB": "United Kingdom",
	"US": "United States",
	"UY": "Uruguay",
	"UZ": "Uzbekistan",
	"VU": "Vanuatu",
	"VE": "Venezuela, Bolivarian Republic of Venezuela",
	"VN": "Vietnam",
	"VG": "Virgin Islands, British",
	"VI": "Virgin Islands, U.S.",
	"WF": "Wallis and Futuna",
	"YE": "Yemen",
	"ZM": "Zambia",
	"ZW": "Zimbabwe"
  }


export const VALID = {
	PROVIDERS: "PROVIDERS",
	ALL_PROVIDERS: "ALL_PROVIDERS"
}

export const DASHBOARD_TYPE = {
	CLINIC: "CLINIC",
	PROVIDER: "PROVIDER",
	PATIENT: "PATIENT",
	SUBSCRIPTION_COUNT: "SUBSCRIPTION_COUNT"
}

export const PROVIDER_TYPES = {
	supervising_provider: "Supervising Provider",
	other_clinical_staff: "Other Clinical Staff",
	non_clinical_staff: "Non-Clinical Staff"
} 

export const NOTIFICATION_TYPE = {
	UPDATE_PROVIDER: "UPDATE_PROVIDER",
	ADD_PROVIDER: "ADD_PROVIDER",
	ADD_RPM: "ADD_RPM",
	ADMIN_NOTIFICATION: "ADMIN_NOTIFICATION"
}

export const REGISTERED_TYPE = {
	EHR: "EHR",
	ADMIN: "ADMIN"
}

export const GLUCOSE_INTERVAL = {
	ONE: 1,
	TWO: 2
}