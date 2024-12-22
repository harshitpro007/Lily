/**
 * v1 routes
 */

// users routes
// import { userRoute as userRouteV1 } from "@modules/user/v1/userRoute";
import { userRoute as userRouteV1 } from "@modules/user";
import { mealRoute as mealRouteV1 } from "@modules/meal";
import { medicationRoute as medicationRouteV1 } from "@modules/medication"
import { exerciseRoute as exerciseRouteV1 } from "@modules/exercise"
import { notificationRoute as notificationRouteV1 } from "@modules/notification";
export const routes: any = [
	...userRouteV1,
	...mealRouteV1,
	...medicationRouteV1,
	...exerciseRouteV1,
	...notificationRouteV1
];