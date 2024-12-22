import { 
    REGEX, SERVER,
    VALIDATION_MESSAGE,
} from "@config/index";
import Joi = require("joi");
import { DEVICE } from "./adminConstant";

export const sendOtp = Joi.object({
    type: Joi.string()
      .trim()
      .valid("EMAIL", "MOBILE")
      .default("EMAIL")
      .optional(),
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2 })
      .regex(REGEX.EMAIL)
      .required()
  });
  
export const verifyOtp = Joi.object({
    type: Joi.string()
      .trim()
      .valid("EMAIL", "MOBILE")
      .default("EMAIL")
      .optional(),
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2 })
      // .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .regex(REGEX.EMAIL)
      .required(),
    otp: Joi.string().default(SERVER.DEFAULT_OTP).required(),
    mobileNo: Joi.when("type", {
      is: Joi.valid("MOBILE"),
      then: Joi.string()
        .trim()
        .regex(REGEX.MOBILE_NUMBER)
        .required()
        .messages({
          "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
        }),
      otherwise: Joi.string()
        .trim()
        .regex(REGEX.MOBILE_NUMBER)
        .optional()
        .messages({
          "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
        }),
    }),
    deviceId: Joi.when("type", {
      is: Joi.valid("MOBILE"),
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().optional(),
    }),
    deviceToken: Joi.when("type", {
      is: Joi.valid("MOBILE"),
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().optional(),
    }),
});

export const emailTemplate = Joi.object({
    type: Joi.string().trim().required(),
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2 })
      .regex(REGEX.EMAIL)
      .required(),
    name: Joi.string().trim().optional(),
    link: Joi.string().trim().optional(),
    otp: Joi.string().trim().optional(),
    adminName: Joi.string().trim().optional(),
    password: Joi.string().trim().optional(),
    providerType: Joi.string().trim().optional(),
    contract: Joi.string().trim().optional(),
    providerName: Joi.string().trim().optional(),
    clinic_name: Joi.string().trim().optional(),
    amount: Joi.number().optional(),
    duration: Joi.string().trim().optional(),
    requestNo: Joi.string().optional(),
    device: Joi.string().trim().optional().valid(DEVICE.LIBRA_3, DEVICE.DEXCOM_G7, DEVICE.NA),
});

export const message = Joi.object({
  body: Joi.string().trim().required(),
  to: Joi.string().trim().required(),
})
  
export const sendNotification = Joi.object({
  type: Joi.string().trim().required(),
  userId: Joi.array().items(Joi.string().regex(REGEX.MONGO_ID)).optional(),
  details: Joi.object().optional(),
  platform: Joi.string().trim().optional(),
})