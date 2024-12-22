import { 
    REGEX, SERVER, 
    STATUS, USER_TYPE, VALIDATION_CRITERIA, 
    VALIDATION_MESSAGE,
} from "@config/index";
import Joi = require("joi");
import { DEVICE, GLUCOSE_INTERVAL, LANGUAGE, MANAGEMENT, PATIENT_TYPE, SUBSCRIPTION_TYPE, VALID } from "./providerConstant";

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
      .required()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
        "string.min": VALIDATION_MESSAGE.password.minlength,
        "string.max": VALIDATION_MESSAGE.password.maxlength,
        "string.empty": VALIDATION_MESSAGE.password.required,
        "any.required": VALIDATION_MESSAGE.password.required,
      }),
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

export const getProfile = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

export const blockUnblock = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  status  : Joi.string().trim().required().valid(STATUS.INACTIVE, STATUS.ACTIVE)
});

export const changePassword = Joi.object({
    oldPassword: Joi.string().trim().regex(REGEX.PASSWORD).required().messages({
      "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
      "string.min": VALIDATION_MESSAGE.password.minlength,
      "string.max": VALIDATION_MESSAGE.password.maxlength,
      "string.empty": VALIDATION_MESSAGE.password.required,
      "any.required": VALIDATION_MESSAGE.password.required,
    }),
    newPassword: Joi.string().trim().regex(REGEX.PASSWORD).required().messages({
      "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
      "string.min": VALIDATION_MESSAGE.password.minlength,
      "string.max": VALIDATION_MESSAGE.password.maxlength,
      "string.empty": VALIDATION_MESSAGE.password.required,
      "any.required": VALIDATION_MESSAGE.password.required,
    }),
    confirmPassword: Joi.string().trim().regex(REGEX.PASSWORD).optional().messages({
      "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
      "string.min": VALIDATION_MESSAGE.password.minlength,
      "string.max": VALIDATION_MESSAGE.password.maxlength,
      "string.empty": VALIDATION_MESSAGE.password.required,
      "any.required": VALIDATION_MESSAGE.password.required,
    }),
});

export const changeProfile = Joi.object({
  profilePicture: Joi.string().trim().allow(null, '').optional(),
  clinicName: Joi.string().trim().optional(),
  zipCode: Joi.string()
  .pattern(/^[0-9]+$/)
  .optional(), 
  street: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  countryCode: Joi.string().trim().optional(),
  glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
  email: Joi.string()
  .trim()
  .lowercase()
  .email({ minDomainSegments: 2 })
  .regex(REGEX.EMAIL)
  .optional(),
  mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
  adminName: Joi.string().trim().optional(),
  currentPassword: Joi.string().trim().regex(REGEX.PASSWORD).optional().messages({
    "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
    "string.min": VALIDATION_MESSAGE.password.minlength,
    "string.max": VALIDATION_MESSAGE.password.maxlength,
    "string.empty": VALIDATION_MESSAGE.password.required,
    "any.required": VALIDATION_MESSAGE.password.required,
  }),
  newPassword: Joi.string().trim().regex(REGEX.PASSWORD).optional().messages({
    "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
    "string.min": VALIDATION_MESSAGE.password.minlength,
    "string.max": VALIDATION_MESSAGE.password.maxlength,
    "string.empty": VALIDATION_MESSAGE.password.required,
    "any.required": VALIDATION_MESSAGE.password.required,
  }),
  confirmPassword: Joi.string().trim().regex(REGEX.PASSWORD).optional().messages({
    "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
    "string.min": VALIDATION_MESSAGE.password.minlength,
    "string.max": VALIDATION_MESSAGE.password.maxlength,
    "string.empty": VALIDATION_MESSAGE.password.required,
    "any.required": VALIDATION_MESSAGE.password.required,
  }),
});

export const provider = Joi.object({
  profilePicture: Joi.string().trim().allow(null, '').optional(),
  clinicName: Joi.string().trim().required(),
  adminName: Joi.string().trim().required(),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .regex(REGEX.EMAIL)
    .required(),
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

export const patient = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  street: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  state: Joi.string().trim().required(),
  zipCode: Joi.string().trim().required(),
  profilePicture: Joi.string().trim().optional(),
  countryCode: Joi.string().optional(),
  mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .regex(REGEX.EMAIL)
    .optional(),
  providerId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  dob: Joi.string().required().description("MM/DD/YYYY"),
  dueDate: Joi.number().required(),
  language: Joi.string().trim().required().valid(LANGUAGE.ENGLISH, LANGUAGE.SPANISH),
  patientType: Joi.string().trim().optional().valid(PATIENT_TYPE.GDM, PATIENT_TYPE.T1, PATIENT_TYPE.T2, PATIENT_TYPE.NA),
  management: Joi.string().trim().optional().valid(MANAGEMENT.DIET, MANAGEMENT.MED),
  device: Joi.string().trim().optional().valid(DEVICE.LIBRA_3, DEVICE.DEXCOM_G7, DEVICE.NA),
  medication: Joi.string().trim().optional(),
  clinicId: Joi.string().trim().required(),
  glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
})

export const decrypt = Joi.object({
  statusCode: Joi.number().optional(),
  data: Joi.string().required()
})

export const getProviders = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search by name"),
  sortBy: Joi.string().trim().valid("created","clinicName", "registeredType").optional().description("created"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
  subscriptionType: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: Monthly, Annual'),
  isExport: Joi.boolean(),
  valid: Joi.string().trim().optional().valid(...Object.values(VALID)).default(VALID.PROVIDERS),
})

export const getPatients = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search by name"),
  sortBy: Joi.string().trim().valid("created","fullName", "gest", "patientType", "device", "lastLogin", "management", "rpm", "ppg", "fpg", "dueDate").optional().description("created, fullName, gest, patientType, device, lastLogin, management, rpm, ppg, fpg, dueDate"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
  management: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: DIET, MED'),
  patientType: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: GDM, T1, T2'),
  status: Joi.string().trim().optional().valid(STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING),
  rpmFromDate: Joi.number().optional().description("in timestamp"),
  rpmToDate: Joi.number().optional().description("in timestamp"),
  clinicId: Joi.string().trim().required(),
  providerId: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by provider name'),
})

export const preSignedUrl = Joi.object({
  filename: Joi.string().trim().required().description('FileName'),
  fileType: Joi.string().trim().required().description('File Type of filename'),
})

export const getPatientProfile = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const ehrLogin = Joi.object({
  ehrToken: Joi.string()
    .trim()
    .required(),
  deviceId: Joi.string().trim().required(),
  deviceToken: Joi.string().trim().required(),
})

export const sentInvite = Joi.object({
  providerId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const sentInviteToPatient = Joi.object({
  patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
})

export const verifyToken = Joi.object({
  token: Joi.string().trim().required().description("verification token")
});

export const libra = Joi.object({
  token: Joi.string().trim().required().description("libra bearer token"),
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  numPeriods: Joi.number().required(),
  period: Joi.number().required()
});

export const dexcom = Joi.object({
  username: Joi.string().trim().required().description("dexcom user name"),
  password: Joi.string().trim().required().description("dexcom user pass"),
})

export const addPorvider = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  countryCode: Joi.string().optional(),
  mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ minDomainSegments: 2 })
    .regex(REGEX.EMAIL)
    .required(),
  userType: Joi.string().trim().valid(
    USER_TYPE.PROVIDER,
    USER_TYPE.DOCTOR, 
    USER_TYPE.NURSE, 
    USER_TYPE.STAFF
  ).required(),
  isMainProvider: Joi.boolean().optional().description("true, false"),
  language: Joi.string().trim().required().valid(...Object.values(LANGUAGE)),
  dob: Joi.number().optional(),
  clinicId: Joi.string().trim().required(),
  organizationalNPI: Joi.string()
  .pattern(/^[0-9]{10}$/)
  .optional(),
});

export const getProvidersListing = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search by name"),
  sortBy: Joi.string().trim().valid("lastLogin","adminName","created").optional().description("lastLogin, adminName, created"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  userType: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by userType: PROVIDER, DOCTOR, NURSE, STAFF'),
  status: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: ACTIVE, INACTIVE'),
  clinicId: Joi.string().trim().required(),
})

export const providerDetails = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const changeProviderProfile = Joi.object({
  providerId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  countryCode: Joi.string().trim().optional(),
  mobileNo: Joi.string()
  .trim()
  .regex(REGEX.MOBILE_NUMBER)
  .optional()
  .messages({
    "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
  }),
  userType: Joi.string().trim().valid(
    USER_TYPE.PROVIDER,
    USER_TYPE.DOCTOR, 
    USER_TYPE.NURSE, 
    USER_TYPE.STAFF
  ).optional(),
  isMainProvider: Joi.boolean().optional().description("true, false"),
  profilePicture: Joi.string().trim().optional(),
  language: Joi.string().trim().optional().valid(...Object.values(LANGUAGE)),
  dob: Joi.number().optional(),
  organizationalNPI: Joi.string()
  .pattern(/^[0-9]{10}$/)
  .optional(),
});

export const clinicDetail = Joi.object({
  clinicName: Joi.string().trim().required(),
})

export const providerDetail = Joi.object({
  providerName: Joi.string().trim().required(),
})

export const getCityState = Joi.object({
  codes: Joi.string().trim().required(),
})

export const searchProviders = Joi.object({
  searchKey: Joi.string().trim().required().description("Search by name"),
  clinicId: Joi.string().trim().required(),
})

export const editPatientStatus = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  status: Joi.string().trim().regex(REGEX.MONGO_ID).required().valid(STATUS.ACTIVE, STATUS.INACTIVE),
});

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

export const epicUser = Joi.object({
  mobileNo: Joi.string().trim().optional(),
  dob: Joi.string().trim().optional(),
  fistName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional()
})

export const epic = Joi.object({
  patientId: Joi.string().trim().required()
})