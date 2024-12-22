/**
 * v1 routes
 */

// users routes
// import { userRoute as userRouteV1 } from "@modules/user/v1/userRoute";
import { providerRoute as providerRouteV1 } from "@modules/provider";
import { subscriptionRoute as subscriptionRouteV1 } from "@modules/subscription";
import { patientRoute as patientRouteV1 } from "@modules/patient";
import { ticketRoute as ticketRouteV1 } from "@modules/support";
import { notificationRoute as notificationRouteV1 } from "@modules/notification"

export const routes: any = [
	...providerRouteV1,
	...subscriptionRouteV1,
	...patientRouteV1,
	...ticketRouteV1,
	...notificationRouteV1
];