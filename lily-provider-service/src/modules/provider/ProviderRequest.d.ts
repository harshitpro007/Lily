declare namespace ProviderRequest {

	export interface SignUp extends Device {
		email: string;
		password: string;
	}

	export interface Create {
		clinicName?: string;
		adminName?: string;
		email?: string;
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
		profilePicture?: string;
		userType?:string;
		subscriptionType?:string;
		subscriptionCharges?: number;
		subscriptionDetails?: string;
		organizationalNPI?: string;
		contract?: string;
		status?:string;
		created?: number;
		hash?: string;
		salt?: string;
		totalPaitents?: number;
		totalProviders?: number;
		isPasswordReset?: boolean;
		isSubscribed?: boolean;
		isMainProvider?: boolean;
		clinicId: string; 
		createdBy: string;
		resendDate?: number;
		registeredType?: string;
		subscriptionStartDate?: number;
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
		type?: string;
		email: string;
		mobileNo?: string;
	}
	export interface PreSignedUrl {
		filename:"string",
		fileType:"string"
	}
	export interface Payload {
		data: string;
	}

	export interface ResetPassword{
		userId?: string;
		salt?: string;
		hash?: string;
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

	export interface ChangeClinicPassword {
		oldPassword: string,
		newPassword: string,
		confirmPassword?:string,
		hash?: string,
		email?:string,
		encryptedToken: string;
	}
	export interface ChangeProfile {
		clinicName?: string;
		email?: string;
		street?: string;
		city?: string;
		state?: string;
		countryCode?: string;
		mobileNo?: string;
		fullMobileNo?: string;
		profilePicture?: string;
		zipCode?: string;
		currentPassword?: string;
		newPassword?: string;
		confirmPassword?: string;
		hash?: string;
		providerId?: string;
		firstName?: string;
		lastName?: string;
		fullName?: string;
		userType?: string;
		isMainProvider?: boolean;
		dob: number;
		language: string;
		organizationalNPI?: string;
		adminName?: string;
		glucoseInterval?: number;
	}

	export interface decrypt {
		statusCode?: number,
		data: string
	}

	export interface CreatePatient{
		firstName: string;
		lastName: string;
		address: string;
		countryCode?: string;
		mobileNo?: string;
		email: string;
		dob: string;
		dueDate: number;
		language: string;
		management: string;
		device: string;
		medication: string;
		patientType: string;
		clinicId: string;
		providerName?: string;
		glucoseInterval?: number;
	}

	export interface ProviderListing extends ListingRequest {
		userType?: string;
		latestUsers: boolean;
		languageCode?:string;
		isExport?:boolean;
		isMigratedUser?: boolean;
		subscriptionType?: string;
		clinicId?: string;
		valid?: string;
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
		clinicId?: string
	}

	export interface EhrLogin extends Device, Create{
		ehrToken: string;
	}

	export interface SentInvite extends Create{
		providerId: string;
	}

	export interface SentInviteToPatient extends CreatePatient{
		patientId: string;
	}

	export interface VerifyLink{
		token: string;
	}

	export interface AddProvider extends Create{
		firstName: string;
		lastName: string;
		role: string;
		clinicId: string;
		isMainProvider?: boolean;
		addedBy?: any;
		language: string;
		subscriptionEndDate?: number;
	}

	export interface Clinic{
        clinicName: string;
    }

	export interface Provider{
        providerName: string;
    }

	export interface GetCity{
		codes: string;
		country: string;
	}

	export interface EditProvider{
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
		salt?: string;
		hash?: string;
		contract?: string;
		subscriptionType?: string;
		subscriptionCharges?: number;
		subscriptionDetails?: string;
		organizationalNPI?: string;
		glucoseInterval?: number;
	}
	export interface Libra {
		token: string;
		userId: string;
		numPeriods: number;
		period: number;
	}
	export interface Dexcom {
		username?: string;
		password?: string;
	}
}