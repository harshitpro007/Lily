declare namespace MedicationRequest {
    export interface Payload {
		data: string;
	}

	export interface addMedication {
		userId: any;
		category?: string;
		time?: number;
		name?: string;
		type?: string;
		date?: string;
        dosage?: number;
		fromDate?: number;
		toDate?: number;
		dateAsString?: string;
		medicationTime?: string;
	}

	export interface editMedication{
		medicationId: string;
		category?: string;
		name?: string;
		type?: string;
    dosage?: number;
		medicationTime?: string;
	}

	export interface getMedication{
		date: string;
		fromDate?: number;
		toDate?: number;
	}

	export interface QuickSummary{
        patientId: string;
        fromDate: number;
        toDate: number;
        isExport: boolean;
				cgmActiveTime: string;
        gmi: string;
        cov: string;
		glucoseInterval?: number;
    }
}