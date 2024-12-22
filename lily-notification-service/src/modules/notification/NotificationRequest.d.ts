declare namespace NotificationRequest {
  export interface template {
    type: string;
    params: object;
  }	
  export interface Payload {
		data: string;
	}

  export interface Mail{
    type?: string; 
    email?: string;
    name?: string;
    link?: string;
    otp?: string;
    adminName?: string;
    password?: string; 
    providerName?: string;
    privacyPolicy?: string;
    termsAndConditions?: string;
    requestNo?:string
  }

  export interface Message{
    to: string;
    body: string;
  }

  export interface Notification{
    type?: string;
    userId?: [string];
    details?: any;
    platform?: string;
  }
}