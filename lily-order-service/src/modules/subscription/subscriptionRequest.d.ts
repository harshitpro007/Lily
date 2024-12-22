declare namespace SubscriptionRequest {

	export interface addSubscription{
		userId: any;
		email?: string;
		subscriptionType?: string;
		amount?: number;
		clinicId?: string;
		status?: string;
		clinicName?: string;
		stripeCustomerId?: string;
		subscriptionStartDate?: number;
		subscriptionEndDate?: number;
		invoiceId?: string;
		planId?: string;
		created?: number;
    }

    export interface Payload {
		data: string;
	}

	export interface SubscriptionDetails{
		clinicId: string;
	}

	export interface SubscriptionListing  extends ListingRequest{
        isExport?: boolean
    }

	export interface EditSubscriptionDetails{
        clinicId: string;
        subscriptionDetails: string;
    }
}