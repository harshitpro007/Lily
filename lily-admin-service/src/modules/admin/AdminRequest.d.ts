declare namespace AdminRequest {

	export interface Payload {
		data: string;
	}
	export interface SignUp extends Device {
		email: string;
		password: string;
	}

	export interface Create {
		firstname?: string;
		lastname?: string;
		email: string;
		password: string;
		created?: number;
	}

	export interface SendOtp {
		type?: string;
		email: string;
		mobileNo?: string;
	}

	export interface PreSignedUrl {
		filename:"string",
		fileType:"string"
	}
	export interface VerifyOTP extends Device {
		type?: string;
		email: string;
		otp: string;
		mobileNo?: string;
	}

	export interface Login extends Device {
		email: string;
		password: string;
	}

	export interface ForgotPassword {
		email: string;
	}

	export interface ChangeForgotPassword {
		newPassword: string;
		confirmPassword: string;
		hash?: string;
		email?: string;
		encryptedToken: string;
	}

	export interface updateStatus {
		userId:string;
		status: string;
	}

	export interface VerifyUser {
		isApproved: string;
		userId: string;
		reason?: string;
		declinedReason?: string;
	}

	export interface SkipSteps {
		type: string;
	}

	export interface supportChat {
		message: string;
		type: number;
		userId?: string;
	}
	export interface AboutMe {
		userId?: string;
		name?: string;
		firstName: string;
		lastName: string;
		dob: number;
		gender: string;
		language: string;
		interpreterRequired: boolean;
		identifyAsAboriginal: boolean;
		location: GeoLocation;
		residentialAddress: GeoLocation;
		postalAddress: GeoLocation;
		aboutMe: string;
	}
	export interface EditProfilePic {
		profilePicture: string;
	}


	export interface Setting {
		pushNotificationStatus: boolean;
		groupaNotificationStatus: boolean;
		isProfileHidden: boolean;
	}

	export interface UploadDocument {
		type: string;
		documentUrl: string;
		documentUploadToken?: string;
	}

	export interface NotificationList {
		pageNo: number,
		limit: number
	}

	export interface ManageNotification {
		pushNotificationStatus: boolean;
		groupaNotificationStatus: boolean;
	}
	export interface NotificationStatus {
		isRead: boolean;
		notificationId: boolean;
	}

	export interface ProfileImage {
		profilePicture: string;
		userId?: string;
	}

	export interface RatingList extends ListingRequest {
		userId?: string;
	}

	export interface ChangePassword {
		oldPassword: string,
		newPassword: string,
		confirmPassword?:string,
		hash?: string,
		email?:string,
	}
	export interface ChangeProfile {
		profilePicture?: string,
		name?: string
	}
	export interface decrypt {
		statusCode?: number,
		data: string
	}

	export interface CreateProvider{
		clinicName: string;
		adminName: string;
		email: string;
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		mobileNo: string;
		profilePicture?: string;
		providerType?:string;
		subscriptionType?:string;
		subscriptionCharges: number;
		subscriptionDetails?: string;
		organizationalNPI: string;
		contract?: string;
		status?:string;
		created?: number;
		glucoseInterval?: number;
	}

	export interface ProviderListing extends ListingRequest {
		userType?: string;
		latestUsers: boolean;
		languageCode?:string;
		isExport?:boolean;
		isMigratedUser?: boolean;
		subscriptionType?: string;
	}

	export interface SentInvite extends CreateProvider{
		providerId: string;
	}

	export interface VerifyLink{
		token: string;
	}

	export interface TicketStatus {
		_id:string;
		status?: string;
	}

	export interface EditProvivder{
		userId: string;
		adminName?: string;
		email?: string;
		zipCode?: string;
		state?: string;
		city?: string;
		street?: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
	}
}