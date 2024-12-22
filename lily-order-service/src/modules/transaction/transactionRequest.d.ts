declare namespace TransactionRequest {

	export interface addTransaction{
		userId: any;
        transactionId: number;
        originalTransactionId: string;
		subscriptionType: string;
		amount: number;
		clinicId: string;
		status: string;
		clinicName?: string;
    }

		export interface transactionId {
			transactionId: string;
		}

    export interface Payload {
		data: string;
	}

	export interface TransactionListing extends ListingRequest {
        clinicId?: string;
		subscriptionType?: string;
		isExport?: boolean
    }

	export interface Payment {
		fromDate: number;
		toDate: number;
	}

	export interface Amount{
        subscriptionType: string;
    }
}