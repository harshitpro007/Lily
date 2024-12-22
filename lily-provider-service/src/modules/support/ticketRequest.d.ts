declare namespace TicketRequest {

	export interface createTicket{
		email: string;		
    firstName: string;
    lastName: string;
		details: string;
		userId?:string;
		requestNo?:string;
		created?:number;
		status?:string;
		clinicId?:string;
		clinicName?:string;
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

	export interface Ticket{
		_id: string;
		status?: string;
		details?: string;
		email?: string;		
    firstName?: string;
    lastName?: string;
  }
}