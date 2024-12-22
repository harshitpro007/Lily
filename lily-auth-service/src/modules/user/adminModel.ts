import mongoose, { Document, model, Model, Schema } from "mongoose";
import { DB_MODEL_REF, SERVER, STATUS, USER_TYPE, SUB_ADMIN_ROLES } from "@config/index";

export interface IAdmin extends Document {
    _id: string;
    profilePicture?: string;
    name: string;
    email: string;
    salt: string;
    hash: string;
    userType: string;
    role?: string;
    webToken: string;
    status: string;
    created: number;
}

const adminSchema: Schema = new mongoose.Schema({
    //first & last 
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
    role: {type: String, required: false, enum: [SUB_ADMIN_ROLES.CONTENT_MODERATION_TEAM, SUB_ADMIN_ROLES.USER_REPORT_MANAGEMENT]},
    mobileNumber: {type: String, required: false},
    status: {
        type: String,
        enum: [STATUS.BLOCKED, STATUS.ACTIVE, STATUS.DELETED],
        default: STATUS.ACTIVE
    },
    created: { type: Number, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});



// Export admin
export const admins: Model<IAdmin> = model<IAdmin>(DB_MODEL_REF.ADMIN, adminSchema);
