declare interface LoginHistoryRequest extends Device {
	userId: {
		_id: string;
		isApproved?: boolean;
		name?: string;
		firstName?: string;
		lastName?: string;
		email: string;
		countryCode?: string;
		mobileNo?: string;
		pushNotificationStatus?: boolean;
		groupaNotificationStatus?: boolean;
		userType: string;
		status: string;
	};
	lastLogin?: number;
	location?: {};
}