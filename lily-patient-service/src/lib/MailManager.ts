import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import { sendMessageToFlock } from "@utils/FlockUtils";
import * as nodemailer from "nodemailer";
const sgMail = require("@sendgrid/mail");

export class MailManager {

	async sendMail(params) {
		let transporter;
		
		transporter = nodemailer.createTransport({
			host: SERVER.MAIL.SMTP.HOST,
			port: SERVER.MAIL.SMTP.PORT,
			secure: SERVER.MAIL.SMTP.SECURE, // use SSL
			//	requireTLS: true,
			auth: {
				user: SERVER.MAIL.SMTP.USER,
				pass: SERVER.MAIL.SMTP.PASSWORD
			}
		});
		const mailOptions = {
			from: `${SERVER.APP_NAME} <${SERVER.MAIL.SMTP.FROM_MAIL}>`, 
			to: params.email, 
			subject: params.subject, 
			html: params.content
		};
		return new Promise(function (resolve, reject) {
			return transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					sendMessageToFlock({ "title": "sendMail", "error": error });
					resolve(SERVER.ENVIRONMENT !== "production");
				} else {
					resolve(true);
				}
			});
		});
	}

	async forgotPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}
}

export const mailManager = new MailManager();