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
			VERIFY_EMAIL: 5 * 60 * 1000, // 5 mins
			VERIFY_MOBILE: 2 * 60 * 1000, // 2 mins
			TOKEN_EXPIRE: 24 * 60 * 60 * 1000, // 24 hours
			ADMIN_OTP_VERIFY: 10 * 60 * 1000, // 10 mins
		},
		ISSUER: process.env["APP_URL"]
	},
	JWT_PRIVATE_KEY: process.cwd() + "/keys/jwtRS256.key",
	JWT_PUBLIC_KEY: process.cwd() + "/keys/jwtRS256.key.pub",
	// for private.key file use RS256, SHA256, RSA
	LIBRE_GUIDE_URL: "https://preprod-media.lilylink.com/Connecting+LilyLink+with+Freestyle+Libre+Instructions.pdf",
	DEXCOM_GUIDE_URL: "https://www.lilylink.com/dexcom-setup-guide",
	ACCUCHECK_GUIDE_URL: "https://www.lilylink.com/accu-chek-setup-guide",
	JWT_ALGO: "RS256",
	SALT_ROUNDS: 10,
	ENC: "102938$#@$^@1ERF",
	CHUNK_SIZE: 500,
	APP_URL: process.env["APP_URL"],
	NOTIFICATION_URL: process.env["NOTIFICATION_URL"],
	NOTIFICATION_MICROSERVICE_URL: process.env["NOTIFICATION_MICROSERVICE_URL"],
	API_BASE_URL: "/"+"notification"+"/api",
	CREATE_AUTH_TOKEN:"create-auth-token",
	VERIFY_AUTH_TOKEN:"verify-auth-token",
	VERIFY_VERIFICATION_TOKEN:"verify-verification-token",
	DEV_SECRET_NAME: "lily-dev-secrets",
	STAGING_SECRET_NAME: "lily-staging-secrets",
	PREPROD_SECRET_NAME: "lily-preprod-env-secrets",
	PRODUCTION_SECRET_NAME: "lily-production-env-secrets",
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
	ADMIN_CREDENTIALS: {
		EMAIL: process.env["ADMIN_EMAIL"],
		PASSWORD: process.env["ADMIN_PASSWORD"],
		NAME: process.env["ADMIN_NAME"],
		URL:process.env['ADMIN_URL']
	},
	ADMIN_END_POINTS:{
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
			PASSWORD: process.env["SMTP_PASSWORD"]
		}
	},

	MESSAGEBIRD: {
		ACCESS_KEY: process.env["MESSAGEBIRD_ACCESS_KEY"]
	},
	BASIC_AUTH: {
		NAME: process.env["NAME"],
		PASS: process.env["PASS"]
	},
	API_KEY: "1234",
	AWS: {
		REGION: 'us-east-1'
	},
	AWS_IAM_USER: {
		ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY"],
		SECRET_ACCESS_KEY: process.env["AWS_SECRET_KEY"]
	},
	S3: {
		BUCKET_NAME: process.env["S3_BUCKET_NAME"],
		REGION: process.env["S3_REGION"],
		BUCKET_URL: process.env["BUCKET_URL"]
	},
	ENVIRONMENT: process.env["ENVIRONMENT"],
	IP: process.env["IP"],
	NOTIFICATION_PORT: process.env["NOTIFICATION_PORT"],
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
	SENDGRID_API_KEY: process.env["SENDGRID_API_KEY"],
	SENDGRID_FROM_MAIL: process.env["SENDGRID_FROM_MAIL"],
	TWILIO_ACC_SID: process.env["TWILIO_ACC_SID"],
	TWILIO_AUTH_TOKEN: process.env["TWILIO_AUTH_TOKEN"],
	TWILIO_NUMBER: process.env["TWILIO_NUMBER"],
	IS_FIREBASE_ENABLE: true,
	IS_TWILIO_ENABLE: true,
	IS_SENDGRID_ENABLE: true,
	FIREBASE_TYPE : process.env["FIREBASE_TYPE"],
	FIREBASE_PROJECT_ID: process.env["FIREBASE_PROJECT_ID"],
	FIREBASE_PRIVATE_KEY_ID: process.env["FIREBASE_PRIVATE_KEY_ID"],
	FIREBASE_PRIVATE_KEY : process.env["FIREBASE_PRIVATE_KEY"],
	FIREBASE_CLIENT_EMAIL:process.env["FIREBASE_CLIENT_EMAIL"],
	FIREBASE_CLIENT_ID:process.env["FIREBASE_CLIENT_ID"],
	FIREBASE_AUTH_URI:process.env["FIREBASE_AUTH_URI"],
	FIREBASE_TOKEN_URI:process.env["FIREBASE_TOKEN_URI"],
	FIREBASE_AUTH_CERT_URL:process.env["FIREBASE_AUTH_CERT_URL"],
	FIREBASE_CLINET_CERT_URL:process.env["FIREBASE_CLINET_CERT_URL"],
	FIREBASE_UNIVERSE_DOMAIN:process.env["FIREBASE_UNIVERSE_DOMAIN"],
	LINKS: {
		DEV: {
			PRIVACY_POLICY: "https://lilyadmindev.appskeeper.in/static-content-public/privacy-policy/en",
			TERMS_AND_CONDITIONS: "https://lilyadmindev.appskeeper.in/static-content-public/terms-condition/en",
			FAQ: "https://lilyadmindev.appskeeper.in/static-content-public/faqs/en"
		},
		STAGING: {
			PRIVACY_POLICY: "https://lilyadminstaging.appskeeper.in/static-content-public/privacy-policy/en",
			TERMS_AND_CONDITIONS: "https://lilyadminstaging.appskeeper.in/static-content-public/terms-condition/en",
			FAQ: "https://lilyadminstaging.appskeeper.in/static-content-public/faqs/en"
		},
		PREPROD: {
			PRIVACY_POLICY: "https://preprod-admin.lilylink.com/static-content-public/privacy-policy/en",
			TERMS_AND_CONDITIONS: "https://preprod-admin.lilylink.com/static-content-public/terms-condition/en",
			FAQ: "https://preprod-admin.lilylink.com/static-content-public/faqs/en"
		},
		PRODUCTION: {
			PRIVACY_POLICY: "https://admin.lilylink.com/static-content-public/privacy-policy/en",
			TERMS_AND_CONDITIONS: "https://admin.lilylink.com/static-content-public/terms-condition/en",
			FAQ: "https://admin.lilylink.com/static-content-public/faqs/en"
		}
	}
});