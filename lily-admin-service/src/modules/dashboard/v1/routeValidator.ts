import Joi = require("joi");
import { DASHBOARD_TYPE, SUBSCRIPTION_TYPE } from "@modules/admin/v1/adminConstant";

export const updateDashboard = Joi.object({
    type: Joi.string().required().valid(...Object.values(DASHBOARD_TYPE)),
    amount: Joi.number().optional(),
    subscriptionType: Joi.string().optional().valid(...Object.values(SUBSCRIPTION_TYPE)),
    monthlyExpireCount: Joi.number().optional(),
    annualExpireCount: Joi.number().optional(),
})