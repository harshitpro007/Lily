/**
 * v1 routes
 */

// users routes
import { transactionRoute as transactionRouteV1 } from "@modules/transaction";
import { subscriptionRoute as subscriptionRouteV1 } from "@modules/subscription"

export const routes: any = [
	...transactionRouteV1,
	...subscriptionRouteV1
];