"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, STATUS } from "@config/index";
import { PLATFORM_TYPE } from "./v1/notifcationConstant";

export interface INotification extends Document {
    _id: string;
    title: string;
    description: string;
    platform: string;
    userId: string;
    notificationId: string;
    isRead: boolean;
    status: string;
    created: number;
}

const notificationSchema: Schema = new mongoose.Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    title: { type: String },
    description: { type: String },
    platform: { type: String, enum: Object.values(PLATFORM_TYPE) },
    userId: { type: Schema.Types.ObjectId, required: true },
    notificationId: { type: Schema.Types.ObjectId, required: false },
    status: {
        type: String,
        enum: [STATUS.ACTIVE, STATUS.DELETED],
        default: STATUS.ACTIVE
    },
    isRead: { type: Boolean, default: false },
    created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

export const notification_lists: Model<INotification> = model<INotification>(DB_MODEL_REF.NOTIFICATION_LIST, notificationSchema);
