import axios from "axios";
import { createHmac, randomBytes, randomInt } from "crypto";
import randomstring from "randomstring";
import Boom from "boom";
import { Request, ResponseToolkit } from "@hapi/hapi";

import { GENERATOR, REGEX, SERVER } from "@config/index";
import { logger } from "@lib/logger";
import { ObjectId } from "mongodb";
import moment from "moment";
import mongoose from "mongoose";
const CryptoJS = require("crypto-js");
const TAG = "lily-uploads";

const buildToken = function (payload: TokenData) {
	const userObject: TokenData = {
		"userId": payload.userId || payload["_id"],
		"name": payload.name || undefined,
		"firstName": payload.firstName || undefined,
		"lastName": payload.lastName || undefined,
		"email": payload?.email,
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

/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
*/
const genRandomString = function (length) {
	return randomBytes(Math.ceil(length / 2))
		.toString("hex") /** convert to hexadecimal format */
		.slice(0, length);   /** return required number of characters */
};

const encryptHashPassword = function (password: string, salt: string) {
	const hash = createHmac("sha512", salt); /** Hashing algorithm sha512 */
	hash.update(password);
	return hash.digest("hex");
};

const isObjectId = function (value: string): boolean {
	return REGEX.MONGO_ID.test(value);
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

const getRandomOtp = function (length = 4) {
	return randomstring.generate({ charset: "numeric", length: length });
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

function timeConversion(value) {
	const seconds: number = Number((value / 1000).toFixed(0));
	const minutes: number = Number((value / (1000 * 60)).toFixed(0));
	const hours: number = Number((value / (1000 * 60 * 60)).toFixed(0));
	const days: number = Number((value / (1000 * 60 * 60 * 24)).toFixed(0));

	if (seconds < 60) {
		return seconds + " Sec";
	} else if (minutes < 60) {
		return minutes + " Minutes";
	} else if (hours < 24) {
		return hours + " Hrs";
	} else {
		return days + " Days";
	}
}

const matchPassword = async function (password: string, dbHash: string, salt: string) {
	if (!salt) return false;
	const hash = encryptHashPassword(password, salt);
	if (
		(SERVER.ENVIRONMENT !== "production") ?
			(
				password != SERVER.DEFAULT_PASSWORD &&
				dbHash != hash
			) :
			dbHash != hash
	) {
		return false;
	} else
		return true;
};

const matchOTP = async function (otp: string, redisOTP) {
	if (!redisOTP) return false;
	redisOTP = JSON.parse(redisOTP);
	if (
		(SERVER.ENVIRONMENT !== "production") ?
			(
				otp !== SERVER.DEFAULT_OTP &&
				redisOTP.otp !== otp
			) :
			redisOTP.otp !== otp
	) {
		return false;
	} else
		return true;
};

const getLocationByIp = async (ipAddress: string) => {
	try {
		const response = await axios.get(`http://ip-api.com/json/${ipAddress}`, {
			headers: {
				"Content-Type": "application/json"
			}
		});

		return response.data;
	}
	catch (error) {
		logger.error(error)
		throw error;
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

const passwordGenrator = (len: number) => {
	let length = len || 10;
	let string = GENERATOR.STRING; //to upper 
	let numeric = GENERATOR.NUMBER;
	let punctuation = GENERATOR.PUNCTUATION;
	let password = "";
	let character = "";

	while (password.length < length) {
		let entity1 = randomInt(string.length);
		let entity2 = randomInt(numeric.length);
		let entity3 = randomInt(punctuation.length);

		let hold = string.charAt(entity1);
		hold = (password.length % 2 == 0) ? hold.toUpperCase() : hold;
		character += hold;
		character += numeric.charAt(entity2);
		character += punctuation.charAt(entity3);
		password = character;
	}

	password = password.split('').sort(() => 0.5 - Math.random()).join(''); //NOSONAR
	return password.substring(0, len);
}

const toObjectId = function (_id: string): ObjectId {
	return new ObjectId(_id);
};

const toMongooseObjectId = function (_id: string): mongoose.Types.ObjectId {
	return new mongoose.Types.ObjectId(_id);
};

const deleteFiles = async function (filePath) {
	// delete files inside folder but not the folder itself
	const del = await import('del');
	del.deleteSync([`${filePath}`, `!${SERVER.UPLOAD_DIR}`]);
	logger.info(TAG, "All files deleted successfully.");
};

const escapeSpecialCharacter = function (value: string) {
	return value.replace(REGEX.SEARCH, '\\$&');
};

const parseJwt = (token) => {
	try {
	  return JSON.parse(atob(token.split('.')[1]));
	} catch (e) {
	  return null;
	}
  };

const createDateRanges = async function (dueDate, created){
	const ranges = [];
    let endDate = moment(dueDate);
  	let startDate = moment(created);

	const monthsDifference = endDate.diff(startDate, 'months', true);

	if (monthsDifference >= 9) {
		while(startDate.isSameOrBefore(endDate)) {
			let rangeEnd = startDate.clone().add(29, 'days');
			ranges.push(`${startDate.format('MM/DD/YYYY')} - ${rangeEnd.format('MM/DD/YYYY')}`);
			startDate = rangeEnd.clone().add(1, 'day');
		}
	} else {
		startDate = startDate.subtract(14, 'days');
		while (startDate.isSameOrBefore(endDate)) {
			let rangeEnd = startDate.clone().add(29, 'days');
			ranges.push(`${startDate.format('MM/DD/YYYY')} - ${rangeEnd.format('MM/DD/YYYY')}`);
			startDate = rangeEnd.clone().add(1, 'day');
		}
	}
	return ranges;
}

export {
	buildToken,
	genRandomString,
	encryptHashPassword,
	isObjectId,
	failActionFunction,
	getRandomOtp,
	stringToBoolean,
	timeConversion,
	matchPassword,
	matchOTP,
	getLocationByIp,
	encryptData,
	decryptData,
	passwordGenrator,
	toObjectId,
	deleteFiles,
	escapeSpecialCharacter,
	parseJwt,
	createDateRanges,
	toMongooseObjectId
};