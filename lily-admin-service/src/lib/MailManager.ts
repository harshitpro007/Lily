import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER, ENVIRONMENT } from "@config/index";
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
			secure: SERVER.MAIL.SMTP.SECURE, 
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
					resolve(SERVER.ENVIRONMENT !== ENVIRONMENT.PRODUCTION);
				} else {
					console.log("Message sent: " + info.response);
					resolve(true);
				}
			});
		});
	}

	async forgotPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"link": params.link,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}
}

export const mailManager = new MailManager();