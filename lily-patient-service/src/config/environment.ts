import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const ENVIRONMENT = process.env.NODE_ENV || "local";

if (ENVIRONMENT === "local") {
	if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
		dotenv.config({ path: ".env.local" });
	} else {
		process.exit(1);
	}
}

export const SERVER = Object({
	APP_NAME: "Lily",
	APP_LOGO: "https://appinventiv-development.s3.amazonaws.com/1607946234266_Sqlv5.svg",
	TEMPLATE_PATH: process.cwd() + "/src/views/",
	UPLOAD_DIR: process.cwd() + "/src/uploads/",
	LOG_DIR: process.cwd() + "/logs",
	TOKEN_INFO: {
		EXPIRATION_TIME: {
			USER_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
			ADMIN_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
			BLOCKED_ACCOUNT: 8 * 60 * 60 * 1000, // 8 hours
			FORGOT_PASSWORD: 10 * 60 * 1000, // 10 mins
			VERIFY_EMAIL: 2 * 60 * 1000, // 2 mins
			VERIFY_MOBILE: 2 * 60 * 1000, // 2 mins
			TOKEN_EXPIRE: 24 * 60 * 60 * 1000, // 24 hours
			ADMIN_OTP_VERIFY: 10 * 60 * 1000, // 10 mins
			OTP_LIMIT: 5 * 60 * 1000, // 5 mins
			LINK_LIMIT: 5 * 60 * 1000, // 5 mins
			EPIC_EXPIRY: 60 * 60 * 1000
		},
		ISSUER: process.env["APP_URL"]
	},
	JWT_PRIVATE_KEY: process.cwd() + "/keys/jwtRS256.key",
	JWT_PUBLIC_KEY: process.cwd() + "/keys/jwtRS256.key.pub",
	EPIC_JWT_PRIVATE_KEY: process.cwd() + "/keys/privatekey.pem",
	EPIC_JWT_PUBLIC_KEY: process.cwd() + "/keys/publickey509.pem",
	// for private.key file use RS256, SHA256, RSA
	JWT_ALGO: "RS256",
	LIBRE_GUIDE_URL: "https://preprod-media.lilylink.com/Connecting+LilyLink+with+Freestyle+Libre+Instructions.pdf",
	DEXCOM_GUIDE_URL: "https://www.lilylink.com/dexcom-setup-guide",
	ACCUCHECK_GUIDE_URL: "https://www.lilylink.com/accu-chek-setup-guide",
	SALT_ROUNDS: 10,
	ENC: "102938$#@$^@1ERF",
	CHUNK_SIZE: 1000,
	CHUNKS: 100,
	APP_URL: process.env["APP_URL"],
	PATIENT_URL: process.env["PATIENT_URL"],
	PATIENT_MICROSERVICE_URL: process.env["PATIENT_MICROSERVICE_URL"],
	NOTIFICATION_APP_URL: process.env["NOTIFICATION_APP_URL"],
	ADMIN_APP_URL: process.env["ADMIN_APP_URL"],
	API_BASE_URL: "/"+"patient"+"/api",
	CREATE_AUTH_TOKEN:"create-auth-token",
	VERIFY_AUTH_TOKEN:"verify-auth-token",
	SEND_MAIL: "notification/email-template",
	DASHBOARD: "admin/dashboard",
	SEND_NOTIFICATION: "notification/send",
	SEND_PUSH_NOTIFICATION: "notification/send-notification",
	VERIFY_VERIFICATION_TOKEN:"verify-verification-token",
	DEFAULT_CODE:"123456",
	BYPASS_OTP:"1234",
	OTP_LIMIT: 4,
	EPIC_URL: {
		FHIR_BASE_URL: "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
		OAUTH_URL: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
		CLIENT_ASSERTION_TYPE: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
	},
	DEV_SECRET_NAME: "lily-dev-secrets",
	STAGING_SECRET_NAME: "lily-staging-secrets",
	PREPROD_SECRET_NAME: "lily-preprod-env-secrets",
	PRODUCTION_SECRET_NAME: "lily-production-env-secrets",
	SEND_MESSAGE: "notification/message",
	MONGO: {
		DB_NAME: process.env["DB_NAME"],
		DB_URL: process.env["DB_URL"],
		OPTIONS: {
			user: process.env["DB_USER"],
			pass: process.env["DB_PASSWORD"],
		},
		REPLICA: process.env["DB_REPLICA"],
		REPLICA_OPTION: {
			replicaSet: process.env["DB_REPLICA_SET"],
			authSource: process.env["DB_AUTH_SOURCE"],
			ssl: process.env["DB_SSL"]
		}
	},
	TARGET_MONGO: {
		DB_NAME: process.env["TARGET_DB_NAME"],
		DB_URL: process.env["TARGET_DB_URL"],
		OPTIONS: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	},
	PATIENT_CREDENTIALS: {
		EMAIL: process.env["ADMIN_EMAIL"],
		PASSWORD: process.env["ADMIN_PASSWORD"],
		NAME: process.env["ADMIN_NAME"],
		URL:process.env['PATIENT_URL']
	},
	PATIENT_END_POINTS:{
		FOR_GOT_PASSWORD:'account/reset-password/'
	},
	REDIS: {
		HOST: process.env["REDIS_HOST"],
		PORT: process.env["REDIS_PORT"],
		DB: process.env["REDIS_DB"],
		NAMESPACE: "Lilyapp",
		APP_NAME: "Lily",
		USER: process.env["REDIS_USER"],
		PASS: process.env["REDIS_PASS"]
	},
	MAIL: {
		SMTP: {
			HOST: process.env["SMTP_HOST"],
			PORT: process.env["SMTP_PORT"],
			USER: process.env["SMTP_USER"],
			PASSWORD: process.env["SMTP_PASSWORD"],
			FROM_MAIL: process.env["FROM_MAIL"]
		}
	},

	MESSAGEBIRD: {
		ACCESS_KEY: process.env["MESSAGEBIRD_ACCESS_KEY"]
	},
	BASIC_AUTH: {
		NAME: "lily",
		PASS: "lily@123"
	},
	API_KEY: "1234",
	AWS: {
		REGION: 'us-east-1'
	},
	AWS_IAM_USER: {
		ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY"],
		SECRET_ACCESS_KEY: process.env["AWS_SECRET_KEY"]
	},
	AWS_KMS_ACCESS_KEY: process.env["AWS_KMS_ACCESS_KEY"],
	AWS_KMS_SECRET_KEY: process.env["AWS_KMS_SECRET_KEY"],
	AWS_KMS_ARN: process.env["AWS_KMS_ARN"],
	S3: {
		BUCKET_NAME: process.env["S3_BUCKET_NAME"],
		REGION: process.env["S3_REGION"],
		BUCKET_URL: process.env["BUCKET_URL"],
		ACCESS_KEY_ID: process.env["S3_ACCESS_KEY_ID"],
		SECRET_ACCESS_KEY: process.env["S3_SECRET_ACCESS_KEY"]
	},
	ENVIRONMENT: process.env["ENVIRONMENT"],
	IP: process.env["IP"],
	PATIENT_PORT: process.env["PATIENT_PORT"],
	PROTOCOL: process.env["PROTOCOL"],
	FCM_SERVER_KEY: process.env["FCM_SERVER_KEY"],
	DISPLAY_COLORS: true,
	MAIL_TYPE: 2,
	IS_REDIS_ENABLE: true,
	IS_SINGLE_DEVICE_LOGIN: {
		PARTICIPANT: true,
		SUPPORTER: true
	},
	IS_MAINTENANCE_ENABLE: process.env["IS_MAINTENANCE_ENABLE"],
	FLOCK_URL: process.env["FLOCK_URL"],
	ACTIVITY_TIME: {
		GROUP: 10 * 60 * 1000, // 4 hours
		SHIFT: 10 * 60 * 1000  // 2 hours
	},
	IS_RABBITMQ_DELAYED_ENABLE: false,

	RABBITMQ: {
		URL: process.env["RABBITMQ_URL"],
		QUEUE_NAME: process.env["RABBITMQ_QUEUE_NAME"]
	},
	DEFAULT_PASSWORD: "String@123",
	DEFAULT_OTP: "1234",
	DEFAULT_PROVIDER_CODE: "123456",
	EPIC: {
		EPIC_CLIENTID: "363c0fec-0d38-485c-9dfd-330ba6ff611d",
		EPIC_TOKEN_LINK: "https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
		EPIC_TOKEN_JTI: "lily_epic_jti",
		EPIC_JWT_ALGO: "RS384"
	}
});