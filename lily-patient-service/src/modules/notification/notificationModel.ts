"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/index";
import { PLATFORM_TYPE } from "./v1/notifcationConstant";

export interface INotification extends Document {
  _id: string;
  title: string;
  description: string;
  platform: string;
  isAllUser: boolean;
  users: Array<string>;
  count: number;
  status: string;
  created: number;
}

const notificationSchema: Schema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  title: {type: String},
  description: {type:String},
  platform: {type:String, enum: Object.values(PLATFORM_TYPE)},
  isAllUser:{type: Boolean},
  users: [Schema.Types.ObjectId],
  count: {type:Number, default:0},
  status: {
      type: String,
      enum: [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.DELETED],
      default: STATUS.ACTIVE
  },
  created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

export const notifications: Model<INotification> = model<INotification>(DB_MODEL_REF.NOTIFICATION, notificationSchema);
