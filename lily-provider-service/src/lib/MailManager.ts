import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import * as nodemailer from "nodemailer";
import { sendMessageToFlock } from "@utils/FlockUtils";
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
			from: `${SERVER.APP_NAME} <${SERVER.MAIL.SMTP.FROM_MAIL}>`, // sender email
			to: params.email, // list of receivers
			subject: params.subject, // Subject line
			html: params.content
		};
		console.log(mailOptions);
		return new Promise(function (resolve, reject) {
			return transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.error("sendMail==============>", error);
					sendMessageToFlock({ "title": "sendMail", "error": error });
					resolve(SERVER.ENVIRONMENT !== "production");
				} else {
					console.log("Message sent: " + info.response);
					resolve(true);
				}
			});
		});
	}

	/**
	 * @function forgotPasswordMail
	 * @description  This function sends a forgot password mail to the user.
	 */
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