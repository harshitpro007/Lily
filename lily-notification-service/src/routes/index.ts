/**
 * v1 routes
 */

// users routes
// import { userRoute as userRouteV1 } from "@modules/user/v1/userRoute";
import { adminRoute as adminRouteV1 } from "@modules/admin";
import { notificationRoute as notificationRouteV1 } from "@modules/notification";

export const routes: any = [
	// ...userRouteV1,
	...adminRouteV1,
	...notificationRouteV1
];