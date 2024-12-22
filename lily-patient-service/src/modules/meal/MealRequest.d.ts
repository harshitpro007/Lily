declare namespace MealRequest {
    export interface Payload {
		data: string;
	}

	export interface addMeal {
		userId: any;
		category?: string;
		time?: number;
		mealTime?: string;
		image?: string;
		description?: string;
		carbs?: number;
		notes?: string;
		glucose?: number;
		unit?: string;
		date?: string;
		isGlucoseExists?: boolean;
		isMealExists?: boolean;
		created?: number;
		glucoseInRange: string;
		isGlucoseAdded: boolean;
		isMedicationExists: boolean;
		fromDate?: number;
		toDate?: number;
		dateAsString?: string;
		isDescOrImageExists?: boolean;
		glucose_2hr?: number;
		isGlucoseExist2hr?: boolean;
	}

	export interface addGlucose {
		data: [any];
	}

	export interface editMeal{
		mealId: string;
		image?: string;
		description?: string;
		carbs?: string;
		notes?: string;
		mealTime?: string;
		isDescOrImageExists?: boolean;
		glucose?: number;
		isGlucoseExists?: boolean;
		glucoseInRange: string;
		glucose_2hr?: number;
		isGlucoseExist2hr?: boolean;
	}

	export interface MealId{
		mealId: string;
	}
	export interface getMeal extends Pagination{
		userId?: string;
		category?: string;
		date?: string;
		fromDate?: number;
		toDate?: number;
	}

	export interface GlucoseLogs{
        patientId: string;
        fromDate: number;
        toDate: number;
        isExport: boolean;
		type: string;
		glucoseInterval?: number;
    }

	export interface Averaves {
		type?: string;
		days?: string;
		fromDate?: number;
		toDate?: number;
		glucoseInterval?: number
	}
	
	export interface AddDeviceData {
		glucose: any;
		date?: string;
		userId?: any;
		lastDeviceDataUpdated?: number;
		status?: string;
		deviceType?: string;
	}

	export interface GetDeviceData {
		date?: string;
		fromDate?: number;
		toDate?: number;
		patientId?: string;
	}

	export interface GlucoseHistory{
		clinicId: string;
	}
}