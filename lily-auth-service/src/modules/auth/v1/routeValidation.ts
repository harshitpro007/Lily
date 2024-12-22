import Joi from "joi";

export const createTokens = Joi.object({
      userId: Joi.string().trim().required(),
      email: Joi.string().trim().optional(),
      accessTokenKey: Joi.string().trim().optional(),
      deviceId: Joi.string().trim().optional(),
      type: Joi.string().trim().optional(),
      userType: Joi.string().trim().optional(),
      tokenType: Joi.string().trim().optional(),
      exp: Joi.number().optional()
})

export const createAdminToken = Joi.object({
    userId: Joi.string().trim().required(),
    email: Joi.string().trim().optional(),
    accessTokenKey: Joi.string().trim().optional(),
    deviceId: Joi.string().trim().optional(),
    type: Joi.string().trim().optional(),
    userType: Joi.string().trim().optional(),
    tokenType: Joi.string().trim().optional(),
    exp: Joi.number().optional(),
    role: Joi.string().trim().optional()
})