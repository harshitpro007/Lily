declare interface UserId {
	userId: string;
}

declare interface Device {
	platform?: string;
	deviceId?: string;
	deviceToken?: string;
	accessToken?: string;
	remoteAddress?: string;
	salt?: string;
	timezone?: number;
	language?: string;
}

declare interface JwtPayload {
	iss: string;
	aud: string;
	sub: string;
	deviceId?: string;
	iat: number;
	exp: number;
	prm: string;
}

interface VerificationToken{
	userId: string;
	email:string;
	type: string;
	exp: number;
}

declare interface TokenData extends Device, UserId {
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	countryCode?: string;
	mobileNo?: string;
	userType?: string;
	// status?: number;
	isApproved?: boolean;
	profileSteps?: string[];
	profilePicture?: string;
	created?: number;
}

declare interface ChangePasswordRequest {
	password: string;
	oldPassword: string;
	salt?: string;
	hash?: string;
}

declare interface ComposeMail {
	email: string;
	subject: string;
	message: string;
	name: string;
}

declare interface Pagination {
	pageNo?: number;
	limit?: number;
}

declare interface Filter {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	status?: string;
	fromDate?: number | Date;
	toDate?: number | Date;
	type?: string;
}

declare interface ListingRequest extends Pagination, Filter {
	timezone?: string;
}

declare interface BlockRequest {
	status: string;
	userId: string;
	reason?: string;
}

declare interface DeeplinkRequest {
	android?: string;
	ios?: string;
	fallback?: string;
	token: string;
	name: string;
	type?: string;
	userType?: string;
	jwt?: string;
}

declare interface GeoLocation {
	type: string;
	address: string;
	coordinates: number[];
}

declare interface VerifyOTP {
	email: string;
	otp: string;
}

interface Categories {
	_id: string;
	name: string;
}

interface Interests {
	_id: string;
	name: string;
	image: string;
}

interface PeopleInvolved {
	_id: string;
	name: string;
	profilePicture?: string;
	userType: string;
}

interface Witnesses {
	name: string;
	mobileNo?: string;
	email?: string;
}

interface Attendees {
	_id: string;
	name: string;
	profilePicture?: string;
	userType: string;
	status?: string;
}

interface Categories {
	_id: string;
	name: string;
}

interface Notes {
	_id?: string;
	userId: string;
	name: string;
	profilePicture?: string;
	userType: string;
	mediaType: string;
	text?: string;
	audioUrl?: string;
	declinedReason?: string;
	status: string;
	created: number;
}

// Model Type For DAO manager
declare type ModelNames =
	"login_histories" |
	"versions" |
	"pre_signup"|
	"tokens"|
	"admins"
