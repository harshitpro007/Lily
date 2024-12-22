"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/index";

export interface IDashboard extends Document {
  _id: string;
  totalUsers: number;
  totalPatient: number;
  totalProviders: number;
  totalClinics: number;
  totalSubscriptions: number;
  totalMonthlySubscriptions: number;
  totalAnnualSubscriptions: number;
  totalPayements: number;
  totalCurrentWeekPayements: number;
  totalCurrentMonthPayements: number;
  totalCurrentYearPayements: number;
  activeUsers: number;
  activeSubscription: number;
  InactiveUsers: number;
  InactiveSubscription: number;
  created: number;
  status: string;
  payment: [{
    year: string;
    amount: number;
  }]
}

const dashboardSchema: Schema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  totalUsers: {type:Number, default: 0},
  totalPatient: {type:Number, default: 0},
  totalProviders: {type:Number, default: 0},
  totalClinics: {type:Number, default: 0},
  totalSubscriptions: {type: Number, default: 0},
  totalMonthlySubscriptions: {type: Number, default: 0},
  totalAnnualSubscriptions: {type: Number, default: 0},
  totalPayements: {type: Number, default: 0},
  totalCurrentWeekPayements: {type: Number, default: 0},
  totalCurrentMonthPayements: {type: Number, default: 0},
  totalCurrentYearPayements: {type: Number, default: 0},
  payments: [{
    year: {type:Number},
    amount: {type:Number},
    _id: false
  }],
  activeUsers: {
    type:Number
  },
  InactiveUsers: {
    type:Number
  },
  activeSubscription: {
    type:Number
  },
  InactiveSubscription: {
    type:Number
  },
  status: {
      type: String,
      enum: [STATUS.ACTIVE],
      default: STATUS.ACTIVE
  },
  created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});
dashboardSchema.index({status:1});
export const dashboard: Model<IDashboard> = model<IDashboard>(DB_MODEL_REF.DASHBOARD, dashboardSchema);
