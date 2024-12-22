import Joi from "joi";

import { DEVICE_TYPE, LANGUAGE } from "@config/main.constant";

const authorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : Bearer xyz..."),
	platform: Joi.string()
		.trim()
		.required()
		.valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS, DEVICE_TYPE.WEB)
		.description("device OS '1'-Android, '2'-iOS, '3'-WEB"),
	timezone: Joi.string().default("Asia/Kolkata").optional().description("time zone"),
	offset: Joi.number().default("0").optional().description("time zone offset"),
	// "accept-language": Joi.string().trim().default("en").required().valid(LANGUAGES.map(v => v.code).join(", "))
	"accept-language": Joi.string().trim().default("en").required().valid(...Object.values(LANGUAGE))
}).unknown();

const headerObject = {
	"required": Joi.object({
		platform: Joi.string()
			.trim()
			.required()
			.valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS, DEVICE_TYPE.WEB)
			.description("device OS '1'-Android, '2'-iOS, '3'-WEB")
			.messages({
				"any.required": "Platform is required.",
				"any.only": `Platform must be one of ${Object.values(DEVICE_TYPE).splice(0, 3).join(", ")}.`
			}),
		// timezone: Joi.number().default("0").required().description("time zone"),
		// "accept-language": Joi.string().trim().default("en").required().valid(LANGUAGES.map(v => v.code).join(", "))
		"accept-language": Joi.string().trim().default("en").required().valid(...Object.values(LANGUAGE))

	}).unknown(),

	"optional": Joi.object({
		platform: Joi.string()
			.trim()
			.required()
			.valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS, DEVICE_TYPE.WEB)
			.description("device OS '1'-Android, '2'-iOS, '3'-WEB")
			.messages({
				"any.required": "Platform is required.",
				"any.only": `Platform must be one of ${Object.values(DEVICE_TYPE).splice(0, 3).join(", ")}.`
			}),
		// timezone: Joi.number().default("0").optional().description("time zone")
	}).unknown()
};

export {
	authorizationHeaderObj,
	headerObject
};