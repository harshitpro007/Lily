import Joi from "joi";



export const createTokenSchema = Joi.object({
  statusCode: Joi.number().integer().optional().example("200"),
  accessToken: Joi.string().optional()
});

export const badRequestSchema = Joi.object({
  statusCode: Joi.number().integer().optional().example("400"),
  type: Joi.string().optional().example("BAD_REQUEST"),
  message: Joi.string().optional()  
});


export const internalServerSchema = Joi.object({
  statusCode: Joi.number().integer().optional().example("500"),
  type: Joi.string().optional().example("INTERNAL_SERVER_ERROR"),
  message: Joi.string().optional()
});

