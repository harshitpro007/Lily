declare namespace ExerciseRequest {
    export interface Payload {
		data: string;
	}

	export interface addExercise {
		userId: any;
		time?: number;
		type?: string;
		date?: string;
		dateAsString?: string;
		intensity?: string;
		steps?: number;
		duration?: number;
		distance?: number;
		created?: number;
		category?:string;
	}

	export interface Health {
		userId: any;
		time?: number;
		date?: string;
		dateAsString?: string;
		steps?: number;
		sleep?: number;
		heartRate?: number;
		created?: number;
		category?:string;
		calories?:number;
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
        isExport: boolean
    }
}