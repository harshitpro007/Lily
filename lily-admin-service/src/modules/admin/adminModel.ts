"use strict";

import mongoose, { Document, model, Model, Schema } from "mongoose";
import { encryptHashPassword, genRandomString } from "@utils/appUtils";
import { DB_MODEL_REF, SERVER, STATUS, USER_TYPE } from "@config/index";

export interface IAdmin extends Document {
    _id: string;
    profilePicture?: string;
    name: string;
    email: string;
    salt: string;
    hash: string;
    userType: string;
    webToken: string;
    status: string;
    created: number;
}

const adminSchema: Schema = new mongoose.Schema({
    _id: { type: Schema.Types.ObjectId, required: true, auto: true },
    profilePicture: { type: String, required: false, default: "" },
    name: { type: String, required: false, default: SERVER.ADMIN_CREDENTIALS.NAME },
    email: { type: String, trim: true, lowercase: true, required: true, default: SERVER.ADMIN_CREDENTIALS.EMAIL },
    salt: { type: String, required: false },
    hash: { type: String, required: false },
    userType: {
        type: String,
        enum: [USER_TYPE.ADMIN],
        default: USER_TYPE.ADMIN
    },
    webToken: { type: String, required: false },
    status: {
        type: String,
        enum: [STATUS.BLOCKED, STATUS.UN_BLOCKED, STATUS.DELETED],
        default: STATUS.UN_BLOCKED
    },
    created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

// Load password virtually
adminSchema.virtual("password")
    .get(function () {
        return this._password;
    })
    .set(function (password) {
        this._password = password;
        const salt = this.salt = genRandomString(SERVER.SALT_ROUNDS);
        this.hash = encryptHashPassword(password, salt);
    });

// Export admin
export const admins: Model<IAdmin> = model<IAdmin>(DB_MODEL_REF.ADMIN, adminSchema);
