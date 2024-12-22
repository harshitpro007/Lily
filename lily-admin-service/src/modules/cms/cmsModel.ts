"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/index";

export interface ICMS extends Document {
  _id: string;
  type: string;
  body: [language:string,text:string];
  status: string;
  created: number;
}

const cmsSchema: Schema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  type: {type: String, required: true},
  body: [{
    language: String,
    text: String
  }],
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

export const cms: Model<ICMS> = model<ICMS>(DB_MODEL_REF.CMS, cmsSchema);
