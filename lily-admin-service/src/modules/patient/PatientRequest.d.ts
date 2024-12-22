declare namespace PatientRequest {

    export interface PatientListing  extends ListingRequest{
        clinicName?: string;
        providerName?: string;
        isExport?: boolean;
    }

    export interface Clinic{
        clinicName: string;
    }

    export interface Provider{
        providerName: string;
    }
    
    export interface Payload {
		data: string;
	}

    export interface PatientRpmData{
        clinicId: string;
    }
}