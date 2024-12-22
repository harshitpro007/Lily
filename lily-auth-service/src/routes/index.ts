/**
 * v1 routes
 */

// users routes
import { authRoute as authRouteV1 } from "@modules/auth/v1/authRoute";

export const routes: any = [
	...authRouteV1,
];