declare namespace DashboardRequest {

	export interface Payload {
		data: string;
	}

    export interface updateDashboard{
        type?: string;
        amount?: number;
        subscriptionType?: string;
        monthlyExpireCount?: number;
        annualExpireCount?: number;
    }
}