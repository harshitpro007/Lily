import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import { DEVICE } from "@modules/admin/v1/adminConstant";
const sgMail = require("@sendgrid/mail");

export class MailManager {
	init() {
		sgMail.setApiKey(SERVER.SENDGRID_API_KEY);
  }

	async sendMail(params) {
		try {
			console.log('***************params email',params.email)
			let msg = {
				to: params.email,
				from: `${SERVER.APP_NAME} <${SERVER.SENDGRID_FROM_MAIL}>`,
				subject: params.subject,
				html: params.content,
			};
			if (params.bcc) msg[TEMPLATES.EMAIL.BCC] = params[TEMPLATES.EMAIL.BCC];
			if (params.attachments) {
				msg[TEMPLATES.EMAIL.ATTCHMENTS] = [{
					filename: params.fileName,
					path: params.filePath,
				}];
			}
			return new Promise((resolve) => {
				sgMail.send(msg, function (error, info) {
					if (error) {
						console.error('error mail delivered',error)
						resolve(false);
					} else {
						console.log('info mail delivered',info)
						resolve(true);
					}
				});
			});
		} catch (error) {
			console.log("catch block [sendgrid] sendMail",error)
			throw error		
		}
	}

	async forgotPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "admin-forgot-password.html"))
			.compileFile({
				"link": params.link,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD),
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}
	async forgotPatientPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "patient-forgot-password.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL),
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}
	/**
	 * @function addProviderMail
	 * @description send password of clinic
	 */
	async addProviderMail(params) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "provider-send-password.html"))
			.compileFile({
				"name": params.name,
				"email": params.email,
				"password": params.password,
				"adminName": params.adminName,
				"providerType": params.providerType,
				"link": params.link,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		const emailParams = {
			email: params.email,
			subject: TEMPLATES.EMAIL.SUBJECT.CLINIC_NEW_PROVIDER + ' ' + params.name,
			content: mailContent,
		};
		return await this.sendMail(emailParams);
	}

	async passwordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "patient-send-password.html"))
			.compileFile({
				"password": params.password,
				"name": params.name,
				"email": params.email,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.NEW_PASSWORD,
			"content": mailContent
		});
	}

	/**
	 * @function welcomeEmail
	 * @description send welcome email to user after profile completion
	 * @param params.email: user's email
	 * @param params.name: user's name
	 */
	async welcomeEmail(params) {
		let guideLink;
		if(params.device == DEVICE.LIBRA_3){
			guideLink = SERVER.LIBRE_GUIDE_URL;
		}
		else if(params.device == DEVICE.ACCUCHEK){
			guideLink = SERVER.ACCUCHECK_GUIDE_URL;
		}
		else if(params.device == DEVICE.DEXCOM_G7){
			guideLink = SERVER.DEXCOM_GUIDE_URL;
		}
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "patient-welcome-email.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"providerName": params.providerName,
				"clinic_name": params.clinic_name,
				"device": params.device,
				"guideLink": guideLink,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.WELCOME + ' ' + params.clinic_name,
			"content": mailContent
		});
	}

	/**
	 * @function contactUs
	 * @description contact with lily team
	 * @returns 
	 */
	async contactUs(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "contact-us.html"))
			.compileFile({
				"query": params.query,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL),
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.SUPPORT,
			"content": mailContent
		});
	}

	/**
	 * @function verifyEmail
	 * @description verify users email
	 */
	async verifyEmail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "patient-verify-email.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL),
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.VERIFY_EMAIL,
			"content": mailContent
		});
	}

	/**
	 * @function providerMail
	 * @description send password of clinic
	 */
	async providerMail(params) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "provider-invite.html"))
			.compileFile({
				"name": params.name,
				"email": params.email,
				"password": params.password,
				"contract": params.contract,
				"link": params.link,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		const emailParams = {
			email: params.email,
			subject: TEMPLATES.EMAIL.SUBJECT.ADD_NEW_PROVIDER,
			content: mailContent,
		};
		return await this.sendMail(emailParams);
	}

	async glucoseDataMail(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "glucose-data.html"))
			.compileFile({
				"link": params.link,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.GLUCOSE_DATA,
			"content": mailContent
		});
	}

	async deactivateAccount(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "account-deactivation.html"))
			.compileFile({
				"name": params.name,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.ACCOUNT_DEACTIVATED,
			"content": mailContent
		});
	}

	async activateAccount(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "account-activation.html"))
			.compileFile({
				"name": params.name,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.ACCOUNT_ACTIVATED,
			"content": mailContent
		});
	}

	async subscription(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "subscription.html"))
			.compileFile({
				"name": SERVER.ADMIN_CREDENTIALS.NAME,
				"amount": params.amount,
				"clinic_name": params.clinic_name,
				"duration": params.duration,
				"contract": params.contract,
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": SERVER.ADMIN_CREDENTIALS.EMAIL,
			"subject": TEMPLATES.EMAIL.SUBJECT.SUBSCRIPTION,
			"content": mailContent
		});
	}

	async closeTicket(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "close-ticket.html"))
			.compileFile({
				"requestNo": params.requestNo,			
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.CLOSE_TICKET,
			"content": mailContent
		});
	}

	async emailNotification(params){
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "admin-email-notification.html"))
			.compileFile({
				"title": params.title,	
				"description": params.description,					
				"year": new Date().getFullYear(),
				"privacyPolicy": params.privacyPolicy,
				"termsAndConditions": params.termsAndConditions
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.EMAIL_NOTIFICATION,
			"content": mailContent
		});
	}

	async addProviderInClinic(params){

	}
}

export const mailManager = new MailManager();