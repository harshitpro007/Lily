declare namespace SubscriptionRequest {

	export interface addSubscription{
		userId: any;
		email: string;
		subscriptionType: string;
		amount: number;
		clinicId: string;
		isCardSave?: boolean;
		status: string;
		clinicName?: string;
		stripeCustomerId?: string;
		planId?: string
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

	export interface transactionId {
		transactionId: string;
	}
}