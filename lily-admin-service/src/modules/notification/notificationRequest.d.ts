declare namespace NotificationRequest {

	export interface Payload {
		data: string;
	}
  export interface Notification {
		title: string;
		description: string;
		platform: string;
		isAllUser?: boolean;
		users?: Array<string>
	}

	 export interface editNotification {
		_id: string;
		title?: string;
		description?: string;
		platform?: string;
		isAllUser?: boolean;
		users?: Array<string>
		status?:string;
	 }

	 export interface getNotification {
		_id: string
	 }

	 export interface sendNotification {
		notificationId: string;
	 }
}