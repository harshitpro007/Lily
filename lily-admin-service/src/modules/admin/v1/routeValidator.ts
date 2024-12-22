import { 
    REGEX, SERVER, 
    STATUS, VALIDATION_CRITERIA, 
    VALIDATION_MESSAGE,
} from "@config/index";
import Joi = require("joi");
import { GLUCOSE_INTERVAL, SUBSCRIPTION_TYPE, VALID } from "./adminConstant";

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

export const adminLogin = Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2 })
      .regex(REGEX.EMAIL)
      .required(),
    password: Joi.string()
      .trim()
      .default(SERVER.DEFAULT_PASSWORD)
      .required(),
    deviceId: Joi.string().trim().required(),
    deviceToken: Joi.string().trim().required(),
});

export const forgotPassword = Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .email({ minDomainSegments: 2 })
      .regex(REGEX.EMAIL)
      .required(),
});

export const resetPassword = Joi.object({
    encryptedToken  : Joi.string().trim().required(),
    newPassword: Joi.string()
      .trim()
      .regex(REGEX.PASSWORD)
      .min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
      .max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
      .default(SERVER.DEFAULT_PASSWORD)
      .required()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
        "string.min": VALIDATION_MESSAGE.password.minlength,
        "string.max": VALIDATION_MESSAGE.password.maxlength,
        "string.empty": VALIDATION_MESSAGE.password.required,
        "any.required": VALIDATION_MESSAGE.password.required,
      }),
    confirmPassword: Joi.string()
      .trim()
      .regex(REGEX.PASSWORD)
      .min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
      .max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
      .default(SERVER.DEFAULT_PASSWORD)
      .required()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
        "string.min": VALIDATION_MESSAGE.password.minlength,
        "string.max": VALIDATION_MESSAGE.password.maxlength,
        "string.empty": VALIDATION_MESSAGE.password.required,
        "any.required": VALIDATION_MESSAGE.password.required,
    }),
});

export const getAdminProfile = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

export const blockUnblock = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  status  : Joi.string().trim().required().valid(STATUS.ACTIVE, STATUS.INACTIVE)
});

export const changePassword = Joi.object({
    oldPassword: Joi.string().trim().regex(REGEX.PASSWORD).required(),
    newPassword: Joi.string().trim().regex(REGEX.PASSWORD).required(),
    confirmPassword: Joi.string().trim().regex(REGEX.PASSWORD).optional(),
});

export const changeProfile = Joi.object({
    profilePicture: Joi.string().trim().allow(null, '').optional(),
    name: Joi.string().trim().optional()
});

export const decrypt = Joi.object({
    statusCode: Joi.number().optional(),
    data: Joi.string().required()
})

export const provider = Joi.object({
  profilePicture: Joi.string().trim().allow(null, '').optional(),
  clinicName: Joi.string().trim().required(),
  adminName: Joi.string().trim().required(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    // .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .regex(REGEX.EMAIL)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  street: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  zipCode: Joi.string().trim().required(),
  countryCode: Joi.string().trim().required(),
  mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
  subscriptionType: Joi.string().trim().optional().valid(...Object.values(SUBSCRIPTION_TYPE)),
  subscriptionCharges: Joi.number().optional(),
  subscriptionDetails: Joi.string().trim().optional(),
  contract: Joi.string().trim().required().description("add contract"),
  organizationalNPI: Joi.string()
  .pattern(/^[0-9]{10}$/)
  .optional(),
  glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
})
export const getProviders = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search by clinic name"),
  sortBy: Joi.string().trim().valid("created","clinicName","registeredType").optional().description("created, clinicName"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
  subscriptionType: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: Monthly, Annual'),
  isExport: Joi.boolean(),
  valid: Joi.string().trim().optional().valid(...Object.values(VALID)).default(VALID.PROVIDERS),
})

export const preSignedUrl = Joi.object({
  filename: Joi.string().trim().required().description('FileName'),
  fileType: Joi.string().trim().required().description('File Type of filename'),
})

export const getProfile = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const sentInvite = Joi.object({
  providerId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const verifyToken = Joi.object({
  token: Joi.string().trim().required().description("verification token")
});

export const Listing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search ticket by request number and clinic name"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
  sortBy: Joi.string().trim().valid("created","clinicName").optional().description("created, clinicName"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  status: Joi.string().optional().description("filter by status ACTIVE,DELETED,COMPLETED")
})

export const Ticket = Joi.object({
  _id: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  status: Joi.string().optional().valid(STATUS.COMPLETED)
})

export const editProvider = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  adminName: Joi.string().trim().optional(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .regex(REGEX.EMAIL)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  street: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  zipCode: Joi.string().trim().optional(),
  countryCode: Joi.string().trim().optional(),
  mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
  contract: Joi.string().trim().optional(),
  subscriptionType: Joi.string().trim().optional().valid(...Object.values(SUBSCRIPTION_TYPE)),
  subscriptionCharges: Joi.number().optional(),
  subscriptionDetails: Joi.string().trim().optional(),
  organizationalNPI: Joi.string()
  .pattern(/^[0-9]{10}$/)
  .optional(),
  glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
})