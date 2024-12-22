import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
const sgMail = require("@sendgrid/mail");

export class MailManager {

	async sendMail(params) {
		try {
			sgMail.setApiKey(process.env["SENDGRID_API_KEY"]);
			let msg = {
				to: params.email,
				from: `${SERVER.APP_NAME} <${process.env["FROM_MAIL"]}>`, // sender email
				subject: params.subject,
				html: params.content,
			};
			if (params.bcc) msg["bcc"] = params["bcc"];
			if (params.attachments) {
				msg["attachments"] = [{
					filename: params.fileName,
					path: params.filePath,
				}];
			}
			return new Promise((resolve) => {
				sgMail.send(msg, function (error, info) {
					if (error) {
						resolve(false);
					} else {
						resolve(true);
					}
				});
			});
		} catch (error) {
			throw error;
		}
	}

	async forgotPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"otp": params.otp,
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