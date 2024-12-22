import { DB_MODEL_REF } from "@config/main.constant";
import mongoose, { Document, Schema } from "mongoose";

interface Token extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: Schema.Types.UUID;
    accessToken: Schema.Types.UUID;
}

const tokenSchema: Schema<Token> = new Schema<Token>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_MODEL_REF.USER,
        required: true,
    },
    refreshToken: { type: Schema.Types.UUID, required: true },
    accessToken: { type: Schema.Types.UUID, required: true },

}, { timestamps: true });

export const tokens = mongoose.model<Token>(DB_MODEL_REF.TOKEN, tokenSchema);




