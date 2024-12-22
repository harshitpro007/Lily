declare namespace AdminRequest {

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
		email:string;
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
	export interface ChangeProfile {
		profilePicture?: string,
		name?: string
	}
}