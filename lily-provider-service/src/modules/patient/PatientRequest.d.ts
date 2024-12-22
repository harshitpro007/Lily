declare namespace PatientRequest {

    export interface EditPatientDetails {
        patientId: string;
        firstName: string;
        lastName: string;
        countryCode: string;
        mobileNo: string;
        dob: string;
        dueDate: number;
        language: string;
        patientType: string;
        device: string;
        medication: string;
        address: string;
        management: string;
        glucoseInterval?: number;
    }

    export interface Payload {
        data: string;
    }

    export interface GlucoseLogs{
        patientId: string;
        fromDate: number;
        toDate: number;
        isExport: boolean;
        type: string;
    }

    export interface RpmVisit{
        userId: any;
        providerId: any;
        clinicId: string;
        date: number;
        time: string;
        visitTime: number;
        notes: string;
        isInteraction: boolean;
        communicationMode: string;
        dueDate: number;
        providerName: string;
        type: string;
    }

    export interface editRpm {
        rpmId: string;
        providerId?: string;
        date?: string;
        visitTime?: string;
        notes?: string;
        isInteraction?: boolean;
        communicationMode?: string;
        time?: string;
        type?: string;
    }

    export interface getMeal {
        userId: string;
		category?: string;
		date?: string;
	}

    export interface GetRpmVisit extends ListingRequest{
        userId: string;
        dueDate?: number;
        created?: number;
    }

    export interface QuickSummary{
        patientId: string;
        fromDate: number;
        toDate: number;
        isExport: boolean;
        cgmActiveTime: string;
        gmi: string;
        cov: string;
    }
}
