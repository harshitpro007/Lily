"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/index";

export interface IFaq extends Document {
  _id: string;
  body: [{
    language: string,
    question: string,
    answer: string
  }];
  status: string;
  created: number;
}

const faqSchema: Schema = new mongoose.Schema({
  _id: { type: Schema.Types.ObjectId, required: true, auto: true },
  body: [{
    language: String,
    question: String,
    answer: String
  }],
  status: {
    type: String,
    enum: [STATUS.ACTIVE, STATUS.DEACTIVE, STATUS.DELETED],
    default: STATUS.ACTIVE
  },
  created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

export const faq: Model<IFaq> = model<IFaq>(DB_MODEL_REF.FAQ, faqSchema);
