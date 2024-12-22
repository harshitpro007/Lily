import { 
  DEVICE_TYPE,
    REGEX, SERVER, 
    STATUS, VALIDATION_CRITERIA, 
    VALIDATION_MESSAGE, 
} from "@config/index";
import Joi = require("joi");
import { CRONE_TYPE, DEVICE, GLUCOSE_INTERVAL, LANGUAGE, MANAGEMENT, OTP_TYPE, PATIENT_TYPE } from "./userConstant";

export const sendOtp = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  type: Joi.string().required().valid(...Object.values(OTP_TYPE)).description("VERIFY_MAIL, FORGOT_PASSWORD, VERIFY_MOBILE_NO"),
  countryCode: Joi.string().optional(),
  mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    })
});
  
export const verifyOtp = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  type: Joi.string().required().valid(...Object.values(OTP_TYPE)).description("VERIFY_MAIL, FORGOT_PASSWORD, VERIFY_MOBILE_NO"),
  otp: Joi.string().default(SERVER.DEFAULT_OTP).required(),
  deviceId: Joi.when("type", {
    is: Joi.valid(OTP_TYPE.VERIFY_MAIL),
    then: Joi.string().trim().required(),
    otherwise: Joi.string().trim().optional()
  }),
  deviceToken: Joi.when("type", {
    is: Joi.valid(OTP_TYPE.VERIFY_MAIL),
    then: Joi.string().trim().required(),
    otherwise: Joi.string().trim().optional()
  }),
  countryCode: Joi.when("type", {
    is: Joi.valid(OTP_TYPE.VERIFY_MOBILE_NO),
    then: Joi.string().trim().required(),
    otherwise: Joi.string().trim().optional()
  }),
  mobileNo: Joi.when("type", {
    is: Joi.valid(OTP_TYPE.VERIFY_MOBILE_NO),
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
    })
  }),
});

export const patientLogin = Joi.object({
    providerCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
    dob: Joi.string().required().description("MM/DD/YYYY"),
    deviceId: Joi.string().trim().required(),
    deviceToken: Joi.string().trim().required(),
});

export const decrypt = Joi.object({
  statusCode: Joi.number().optional(),
  data: Joi.string().required()
})

export const forgotPassword = Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .regex(REGEX.EMAIL)
      .required()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
      }),
});

export const resetPassword = Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .regex(REGEX.EMAIL)
      .required()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
      }),
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

export const getUserProfile = Joi.object({
    userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
});

export const blockUnblock = Joi.object({
    email: Joi.string()
      .trim()
      .lowercase()
      .regex(REGEX.EMAIL)
      .required()
      .messages({
        "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
      }),
    status  : Joi.string().trim().required().valid(STATUS.BLOCKED, STATUS.UN_BLOCKED)
});

export const changePassword = Joi.object({
    oldPassword: Joi.string().trim().regex(REGEX.PASSWORD).required(),
    newPassword: Joi.string().trim().regex(REGEX.PASSWORD).required(),
    confirmPassword: Joi.string().trim().regex(REGEX.PASSWORD).optional(),
});

export const changeProfile = Joi.object({
    profilePicture: Joi.string().trim().allow(null, '').optional(),
    fullName: Joi.string().trim().optional(),
    countryCode: Joi.string().optional(),
    mobileNo: Joi.string()
    .trim()
    .regex(REGEX.MOBILE_NUMBER)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern,
    }),
    dob: Joi.string().optional().description("MM/DD/YYYY"),
    address: Joi.string().optional(),
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    isDeviceConnected: Joi.boolean().optional(),
    isMobileVerified: Joi.boolean().optional(),
    language: Joi.string().trim().optional().valid(LANGUAGE.ENGLISH, LANGUAGE.SPANISH),
    glucoseDeviceToken: Joi.string().trim().optional(),
    CgmActiveTime: Joi.string().trim().optional(),
    corffVariation:  Joi.string().trim().optional(),
    gmiPercent: Joi.string().trim().optional(),
    device: Joi.number().optional(),
    region: Joi.string().optional(),
    libraId: Joi.string().trim().optional(),
    glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
    dexcomUserName: Joi.string().trim().optional(),
    dexcomPass: Joi.string().trim().optional(),
});

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
    .regex(REGEX.EMAIL)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  providerId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  dob: Joi.string().required().description("MM/DD/YYYY"),
  dueDate: Joi.number().required(),
  language: Joi.string().trim().required().valid(LANGUAGE.ENGLISH, LANGUAGE.SPANISH),
  patientType: Joi.string().trim().optional().valid(PATIENT_TYPE.GDM, PATIENT_TYPE.T1, PATIENT_TYPE.T2, PATIENT_TYPE.NA),
  management: Joi.string().trim().optional().valid(MANAGEMENT.DIET, MANAGEMENT.MED),
  device: Joi.string().trim().optional().valid(DEVICE.LIBRA_3, DEVICE.DEXCOM_G7, DEVICE.NA),
  medication: Joi.string().trim().optional(),
  clinicId: Joi.string().trim().required(),
  providerName: Joi.string().trim().optional(),
  glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
})

export const getPatients = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
  limit: Joi.number().required().description("limit"),
  searchKey: Joi.string().trim().optional().description("Search by name"),
  sortBy: Joi.string().trim().valid("created","fullName", "gest", "patientType", "device", "lastLogin", "management", "rpm", "ppg", "fpg", "dueDate").optional().description("created, fullName, gest, patientType, device, lastLogin, management, rpm, ppg, fpg, dueDate"),
  sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
  fromDate: Joi.number().optional().description("in timestamp"),
  toDate: Joi.number().optional().description("in timestamp"),
  rpmFromDate: Joi.number().optional().description("in timestamp"),
  rpmToDate: Joi.number().optional().description("in timestamp"),
  management: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: DIET, MED'),
  patientType: Joi.array().items(Joi.string().min(1)).single().optional().description('filter by status: GDM, T1, T2'),
  status: Joi.string().trim().optional().valid(STATUS.ACTIVE, STATUS.INACTIVE, STATUS.PENDING),
  clinicId: Joi.string().trim().required(),
  providerId: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by provider name'),
})

export const signUp = Joi.object({
  fullName: Joi.string().trim().required().regex(REGEX.NAME),
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  password: Joi.string()
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
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.password.pattern,
      "string.min": VALIDATION_MESSAGE.password.minlength,
      "string.max": VALIDATION_MESSAGE.password.maxlength,
      "string.empty": VALIDATION_MESSAGE.password.required,
      "any.required": VALIDATION_MESSAGE.password.required,
  })
})

export const userLogin = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .required()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  password: Joi.string()
    .trim()
    .default(SERVER.DEFAULT_PASSWORD)
    .required(),
  deviceId: Joi.string().trim().required(),
  deviceToken: Joi.string().trim().required(),
});

export const contactUs = Joi.object({
  query: Joi.string().trim().required(),
})

export const generateToken = Joi.object({
  refreshToken: Joi.string().trim().required(),
  deviceId: Joi.string().trim().required(),
  deviceToken: Joi.string().trim().optional(),
})

export const sentInvite = Joi.object({
  patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
  providerName: Joi.string().trim().optional(),
})

export const getAllPatients = Joi.object({
  pageNo: Joi.number().required().description("Page no"),
    limit: Joi.number().required().description("limit"),
    searchKey: Joi.string().trim().optional().description("Search by clinic name"),
    sortBy: Joi.string().trim().valid("created", "fullName").optional().description("created, clinicName"),
    sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
    fromDate: Joi.number().optional().description("in timestamp"),
    toDate: Joi.number().optional().description("in timestamp"),
    clinicId: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by clinic name'),
    status: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by status ACTIVE, INACTIVE, PENDING'),
    providerId: Joi.array().items(Joi.string().trim().min(1)).single().optional().description('filter by provider name'),
    isExport: Joi.boolean(),
    platforms : Joi.string().trim().valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS).optional(),
});

export const patientDetails = Joi.object({
  userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
});

export const editPatient = Joi.object({
  patientId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
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
  email: Joi.string()
    .trim()
    .lowercase()
    .regex(REGEX.EMAIL)
    .optional()
    .messages({
      "string.pattern.base": VALIDATION_MESSAGE.email.pattern,
    }),
  dob: Joi.string().optional().description("MM/DD/YYYY"),
  dueDate: Joi.number().optional(),
  language: Joi.string().trim().optional().valid(LANGUAGE.ENGLISH, LANGUAGE.SPANISH),
  patientType: Joi.string().trim().optional().valid(PATIENT_TYPE.GDM, PATIENT_TYPE.T1, PATIENT_TYPE.T2, PATIENT_TYPE.NA),
  device: Joi.string().trim().optional().valid(DEVICE.LIBRA_3, DEVICE.DEXCOM_G7, DEVICE.NA),
  management: Joi.string().trim().optional().valid(MANAGEMENT.DIET, MANAGEMENT.MED),
  providerId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
  medication: Joi.string().trim().optional(),
  street: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  zipCode: Joi.string().trim().optional(),
  isDelivered: Joi.boolean().optional(),
  deliveredDate: Joi.number().optional(),
  glucoseInterval: Joi.number().valid(...Object.values(GLUCOSE_INTERVAL)).optional(),
});

export const device = Joi.object({
  deviceToken: Joi.string().trim().optional()
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

export const crone = Joi.object({
  type: Joi.string().trim().valid(...Object.values(CRONE_TYPE)).required().description("crone type"),
})