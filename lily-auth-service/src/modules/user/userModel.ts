import mongoose,{ Document, model, Model, Schema } from "mongoose";
import {
	DB_MODEL_REF,
	GENDER,
	STATUS,
	USER_TYPE,
	LOGIN_TYPE
} from "@config/index";
export interface IUser extends Document {
	name?: string;
	firstName?: string;
	lastName?: string;
	email: string;
	isApproved: boolean;
	salt: string;
	hash: string;
	gender?: string;
	profilePicture?: string;
	dob?: string;
	language?: string;
	countryCode?: string;
	mobileNo?: string;
	fullMobileNo?: string;
	isMobileVerified: boolean;
	location?: GeoLocation;
	status: string;
	created: number;
	platform: string;
	userType: string;
	googleSocialId:string;
    appleSocialId:string;
	biography?:string;
	huntingInterests?:Array<string>;
	county: string;
	isProfileSet: boolean;
}
const geoSchema: Schema = new mongoose.Schema({
	type: { type: String, default: "Point" },
	address: { type: String, required: true },
	coordinates: { type: [Number], index: "2dsphere", required: true } // [longitude, latitude]
}, {
	_id: false
});

const huntingArea: Schema = new mongoose.Schema({
	type: { type: Number, required:true },
	area: { type: Schema.Types.ObjectId, required: true },
}, {
	_id: false
});

const socialDataSchema = new Schema({
	profilePic: { type: String, required: false, default: "" },
	firstName: { type: String, required: false },
	lastName: { type: String, required: false },
	socialId: { type: String, required: false },
	email: { type: String, trim: true, lowercase: true },
	phoneNumber: { type: String, trim: true }
})

const userSchema: Schema = new mongoose.Schema({
	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
	name: { type: String, trim: true, required: false }, // for both (participant/supporter)
	firstName: { type: String, trim: true, required: false }, // for both (participant/supporter)
	lastName: { type: String, trim: true, required: false }, // for both (participant/supporter)
	email: { type: String, trim: true, required: true }, // for both (participant/supporter)
	isApproved: { type: Boolean, default: true }, // for both (participant/supporter) (for approval of documents)
	socialData: socialDataSchema,

	salt: { type: String, required: false },
	hash: { type: String, required: false },
	gender: { // for both (participant/supporter)
		type: String,
		required: false,
		enum: Object.values(GENDER)
	},
	profilePicture: { type: String, required: false }, // for both (participant/supporter) (Step 3)
	dob: { type: String, required: false }, // for both (participant/supporter)
	language: { type: String, required: false, default:"en" }, // for both (participant/supporter)
	interpreterRequired: { type: Boolean }, // for both (participant/supporter)
	identifyAsAboriginal: { type: Boolean }, // for both (participant/supporter)
	countryCode: { type: String, required: false },
	mobileNo: { type: String, required: false },
	fullMobileNo: { type: String, required: false },
	isMobileVerified: { type: Boolean, default: false }, // for both (participant/supporter)
	location: geoSchema, // for both (participant/supporter)
	biography: { type: String, required: false },
	huntingInterests : {type:[Schema.Types.ObjectId], required: false},
	huntingArea:[huntingArea],

	postalAddress: { // for both (participant/supporter)
		address: { type: String, required: false },
		coordinates: { type: [Number], required: false } // [longitude, latitude]
	},
	pushNotificationStatus: { type: Boolean, default: true }, // for inapp notifications
	status: {
		type: String,
		enum: [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.DELETED],
		default: STATUS.ACTIVE
	},
	loginType:{type:String,requred:true,default:LOGIN_TYPE.NORMAL},
	googleSocialId: { type: String, required: false },
	appleSocialId: { type: String, required: false },
	platform:{ type: String, required: false },
	county:{ type: String, required: false },
	isProfileSet: { type: Boolean, default: false },
	userType:{ type: String, required: false, default:USER_TYPE.USER },
	created: { type: Number, default: Date.now }
}, {
	versionKey: false,
	timestamps: true
});


userSchema.index({ firstName: 1 });
userSchema.index({ lastName: 1 });
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
userSchema.index({ gender: 1 });
userSchema.index({ mobileNo: 1 });
userSchema.index({ status: 1 });
userSchema.index({ created: -1 });

// Export user
export const users: Model<IUser> = model<IUser>(DB_MODEL_REF.USER, userSchema);