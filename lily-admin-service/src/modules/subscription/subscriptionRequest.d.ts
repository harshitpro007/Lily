declare namespace SubscriptionRequest {

    export interface SubscriptionListing  extends ListingRequest{
        isExport?: boolean
    }
    
    export interface SubscriptionDetails {
        clinicId: string;
    }

    export interface Payload {
		data: string;
	}

    export interface TransactionListing extends ListingRequest {
        clinicId?: string;
        isExport?: boolean
    }

    export interface EditSubscriptionDetails{
        clinicId: string;
        subscriptionDetails: string;
    }

    export interface Amount{
        subscriptionType: string;
    }
}