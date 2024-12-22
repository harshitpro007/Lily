
import { adminRoute as adminRouteV1 } from "@modules/admin";
import { patientRoute as patientRouteV1 } from "@modules/patient";
import { subscriptionRoute as subscriptionRouteV1 } from "@modules/subscription";
import { cmsRoute as cmsRouteV1} from "@modules/cms"
import { notificationRoute as notificationRouteV1 } from "@modules/notification";
import { dashboardRoute as dashboardRouteV1 } from "@modules/dashboard";
export const routes: any = [
	...adminRouteV1,
	...patientRouteV1,
	...subscriptionRouteV1,
	...cmsRouteV1,
	...notificationRouteV1,
	...dashboardRouteV1
];