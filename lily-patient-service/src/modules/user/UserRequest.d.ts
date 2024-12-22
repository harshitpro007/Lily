declare namespace UserRequest {

	export interface SignUp extends Device {
		email: string;
		password: string;
		hash?: string;
		status?: string;
		salt?: string;
		gest?: number;
		rpm?: number;
		ppg?: number;
		fpg?: number;
		userType?: string;
		fullName: string;
		confirmPassword: string;
		isMobileVerified: boolean;
	}

	export interface CreatePatient{
		firstName: string;
		lastName: string;
		fullName?: string;
		street: string;
		city: string;
		state: string;
		zipCode: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo: string;
		email: string;
		dob: string;
		dueDate: number;
		language: string;
		management: string;
		device: string;
		medication: string;
		patientType: string;
		status?: string;
		hash?: string;
		salt?: string;
		gest?: number;
		rpm?: number;
		ppg?: number;
		fpg?: number;
		providerCode?: string;
		providerId?: any;
		userType?: string;
		lastLogin: number;
		isDeviceConnected?: boolean;
		isMobileVerified?: boolean;
		clinicId: string;
		resendDate?: number;
		isGlucoseAdded?: boolean
		addedBy: any;
		providerName?: string;
		isHealthAppConnected?: boolean;
		medicationDate?: number;
		glucoseInterval?: number;
	}

	export interface socialSignup extends Device {
		name: string;
		email: string;
		socialId: string;
		loginType:string;
		deviceId: string;
		deviceToken: string;
		profilePicture?: string;
	}

	export interface SendOtp {
		email: string;
		type: string;
		countryCode?: string;
		mobileNo?:string;
	}
	export interface SendOtpOnMobile {
		countryCode: string;
		mobileNo: string;
	}

	export interface VerifyOTP extends Device {
		type: string;
		email: string;
		otp: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
	}

	export interface Login extends Device {
		email: string;
		password: string;
		code?: number;
		dob?: string;
		providerCode?: string;
	}

	export interface RefereshToken extends Device {
		refreshToken: string;
	}

	export interface ForgotPassword {
		email: string;
	}

	export interface ChangeForgotPassword {
		newPassword: string;
		confirmPassword: string;
		hash?: string;
		email?: string;
		salt?: string;
	}

	export interface updateStatus {
		userId:string;
		status?: string;
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

	export interface Payload {
		data: string;
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

	export interface MyneedAndSKill {
		tags: string[];
		needAndExperience: string;
	}


	export interface EditProfilePic {
		profilePicture: string;
	}


	export interface Setting {
		pushNotificationStatus: boolean;
		groupaNotificationStatus: boolean;
		isProfileHidden: boolean;
	}
	export interface EditInterests {
		interests: Array<Interests>;
	}

	export interface UploadDocument {
		type: string;
		documentUrl: string;
		documentUploadToken?: string;
	}

	export interface decrypt {
		statusCode?: number,
		data: string
	}

	export interface Checkilist {
		type: string;
	}

	export interface AddSignature {
		type: string;
		firstName: string;
		lastName: string;
	}

	export interface Like {
		set: number;
		userId: string;
	}

	
	export interface FriendRequestList extends Pagination {
		searchKey?: string;
	}
	export interface UserChatList extends Pagination {

	}

	export interface ContactUs{
		query: string;
	}
	export interface NotificationList {
		pageNo: number,
		limit: number
	}
	export interface SupportCHatList extends Pagination {
		userId?: string,
		searchKey?: string


	}
	export interface inbox {
		pageNo: number,
		limit: number,
		type: string,
		inboxType: string
	}
	export interface inboxDelete {
		messageIds: Array<string>
	}
	export interface mailStar {
		id: string,
		addLabelIds: Array<string>,
		removeLabelIds: Array<string>
	}
	export interface TimeSHeetHistory {
		pageNo: number,
		limit: number,
		userId: string,
		type: string
	}
	export interface SupporterLog {
		pageNo: number,
		limit: number,
		searchKey: string,
		isExport: boolean,
		userType?:string
	}
	export interface SupporterLogProcessed {
		pageNo: number,
		limit: number,

	}

	export interface ManageNotification {
		pushNotificationStatus: boolean;
		groupaNotificationStatus: boolean;
	}
	export interface NotificationStatus {
		isRead: boolean;
		notificationId: boolean;
	}

	export interface HideProfile {
		isProfileHidden: string;
	}
	export interface OnboardSuccess {
		userId: string;
	}
	export interface ProfileImage {
		profilePicture: string;
		userId?: string;
	}

	export interface RatingList extends ListingRequest {
		userId?: string;
	}

	export interface FriendRequest {
		userId: string;
		status: string;
		requestId?: string;
		friendId?: {
			_id: string;
			name: string;
			profilePicture?: string;
			userType: string;
		};
	}

	export interface UserGraph {
		type: string;
		month?: number;
		year?: number;
		userType?: string;
	}

	export interface ChangePassword {
		oldPassword: string,
		newPassword: string,
		confirmPassword?:string,
		hash?: string,
		email?:string,
	}
	export interface ChangeProfile {
		profilePicture?: string;
		fullName?: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
		dob?: string;
		address?: string;
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		isDeviceConnected?: boolean;
		isMobileVerified?: boolean;
		language?: string;
		glucoseDeviceToken?: string;
		CgmActiveTime?: string;
		corffVariation?: string;
		gmiPercent?: string;
		device?: number;
		region?:string;
		libraId?: string;
		glucoseInterval?: number;
		dexcomUserName?: string;
		dexcomPass?: string;
	}

	export interface PatientListing extends ListingRequest {
		userType?: string;
		latestUsers: boolean;
		languageCode?:string;
		management?: string;
		patientType?: string;
		rpmFromDate?: number;
		rpmToDate?: number;
		ppg?: number;
		fpg?: number;
		clinicId?: string;
        providerId?: string;
        isExport?: boolean;
		platforms?: string;
	}

	export interface SentInvite extends CreatePatient{
		patientId: string;
		resendDate?: number;
	}

	export interface ResetPassword{
		userId?: string;
		salt?: string;
		hash?: string;
	}

	export interface EditPatientDetails {
        patientId: string;
        firstName?: string;
        lastName?: string;
        countryCode?: string;
        mobileNo?: string;
        dob?: string;
        dueDate?: number;
        language?: string;
        patientType?: string;
        device?: string;
        medication?: string;
        street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		fullMobileNo?: string;
		isMobileVerified?: boolean;
		management?: string;
		providerId?: string;
		isDelivered?: boolean;
		deliveredDate?: number;
		email?: string;
		glucoseInterval?: number;
    }

	export interface Crone{
		type: string;
	}
}