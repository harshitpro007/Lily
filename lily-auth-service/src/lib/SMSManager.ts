import { MESSAGES, TEMPLATES, SERVER } from "@config/index";

import Messagebird from "messagebird"
import { logger } from "./logger";
const messagebird=Messagebird.initClient(SERVER.MESSAGEBIRD.ACCESS_KEY)

let smsCounter = 0;

export class SMSManager {

	_sendMessage(mobileNo, body) {
		if (SERVER.ENVIRONMENT !== "production" && smsCounter > 100) {
			return Promise.reject(MESSAGES.ERROR.BLOCKED_MOBILE);
		}

		const params:any = {
			"originator": "",
			"recipients": +mobileNo,
			"body": body
		};
		return new Promise(function (resolve, reject) {
			messagebird.messages.create(params, function (error, response) {
				if (error) {
					logger.error(error);
					reject(error);
				}
				smsCounter++;
				console.log(response);
				resolve(true);
			});
		});
	}

	async sendOTP(countryCode, mobileNo, otp) {
		try {
			const sms = TEMPLATES.SMS.OTP.replace(/OTP/g, otp);
			return await this._sendMessage([countryCode + mobileNo], sms);
		} catch (error) {
			logger.error(error);
			throw error;
		}
	}

}

export const smsManager = new SMSManager();