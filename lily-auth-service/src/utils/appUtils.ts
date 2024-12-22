import Boom from "boom";
import { Request, ResponseToolkit } from "@hapi/hapi";
import { SERVER } from "@config/index";
import { logger } from "@lib/logger";
import { ObjectId } from "mongodb";
const CryptoJS = require("crypto-js");

const buildToken = function (payload: TokenData) {
	const userObject: TokenData = {
		"userId": payload.userId || payload["_id"],
		"name": payload.name || undefined,
		"firstName": payload.firstName || undefined,
		"lastName": payload.lastName || undefined,
		"email": payload.email,
		"countryCode": payload.countryCode || undefined,
		"mobileNo": payload.mobileNo || undefined,
		"userType": payload.userType || payload["aud"],
		"salt": payload.salt || undefined,
		"profilePicture": payload.profilePicture || undefined,
		"profileSteps": payload.profileSteps || undefined,
		"isApproved": payload.isApproved || undefined, // optional
		"created": payload.created || undefined, // optional
		"platform": payload.platform,
		"deviceId": payload.deviceId
	};

	return userObject;
};


const failActionFunction = async function (request: Request, h: ResponseToolkit, error: any) {
	let customErrorMessage = "";
	if (error.name === "ValidationError") {
		customErrorMessage = error.details[0].message;
	} else {
		customErrorMessage = error.output.payload.message;
	}
	customErrorMessage = customErrorMessage.replace(/"/g, "");
	customErrorMessage = customErrorMessage.replace("[", "");
	customErrorMessage = customErrorMessage.replace("]", "");
	return Boom.badRequest(customErrorMessage);
};

const stringToBoolean = function (value: string) {
	switch (value.toString().toLowerCase().trim()) {
		case "true":
		case "yes":
		case "1":
			return true;
		case "false":
		case "no":
		case "0":
		case null:
			return false;
		default:
			return Boolean(value);
	}
};

const encryptData = (text: string) => {
	try {
		const secret = CryptoJS.enc.Utf8.parse(SERVER.ENC);
		const encrypted = CryptoJS.AES.encrypt(text, secret, {
			iv: CryptoJS.enc.Utf8.parse(SERVER.ENC),
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		}).toString();
		return encrypted;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const toObjectId = function (_id: string): ObjectId {
	return new ObjectId(_id);
};

const decryptData = (text: string) => {
	try {
		const encrypted = text;
		const decipher = CryptoJS.AES.decrypt(encrypted, CryptoJS.enc.Utf8.parse(SERVER.ENC), {
			iv: CryptoJS.enc.Utf8.parse(SERVER.ENC),
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		});
		const decrypted = decipher.toString(CryptoJS.enc.Utf8);
		return decrypted			
	} catch (error) {
		logger.error(error);
		return error;
	}
};

export {
	buildToken,
	failActionFunction,
	encryptData,
	decryptData,
	stringToBoolean,
	toObjectId
};