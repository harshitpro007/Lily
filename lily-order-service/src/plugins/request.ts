"use strict";

import { stringToBoolean } from "@utils/appUtils";
import { HTTP_STATUS_CODE, MESSAGES, SERVER } from "@config/index";

// Register request plugin
export const plugin = {
	name: "request-plugin",
	register: async function (server, options) {
		// it works as a middleware with every request
		server.ext("onRequest", (request, h) => {
			// do something
			return h.continue;
		});

		// it works when sending request
		server.ext("onPostAuth", (request, h) => {
			if (
				stringToBoolean(SERVER.IS_MAINTENANCE_ENABLE || "false") &&
				!request.path.includes("/v1/scripts/") &&
				!request.path.includes("/documentation") &&
				!request.path.includes("/swagger") &&
				!request.path.includes("/v1/common/decrypt") &&
				!request.path.includes("/v1/common/encrypt")
			) {
				const res = request.raw.res;
				res.writeHead(HTTP_STATUS_CODE.BAD_REQUEST, { "content-type": "application/json" });
				res.end(JSON.stringify(MESSAGES.ERROR.SERVER_IS_IN_MAINTENANCE()));
				return h.close;
			}

			if (request) {
				console.log("--------------------------------REQUEST STARTS----------------------------------------");
				console.log(request.info.remoteAddress + ": " + request.method.toUpperCase() + " " + request.path);
				console.log("Request Type=======>", request.method.toUpperCase());
				console.log("Request Path=======>", request.path);
				console.log("Request Body=======>", request.payload);
				console.log("Request Params=====>", request.params);
				console.log("Request Query======>", request.query);
				console.log("Authorization======>", request.headers.authorization);
				console.log("api_key============>", request.headers.api_key);
				console.log("platform===========>", request.headers.platform);
				console.log("timezone===========>", request.headers.timezone);
				console.log("offset===========>", request.headers.offset);
				console.log("language===========>", request.headers["accept-language"]);
				console.log("--------------------------------REQUEST ENDS------------------------------------------");
			}
			return h.continue;
		});

		// it works as a middleware with every request
		server.ext("onPreResponse", (request, h) => {
			if (request?.response &&
				!request.path.includes("/deeplink")
			) {
				if (request?.response?.output?.payload) { // for error response
					request.response.output.message = request.i18n.__(request.response.output.payload.type);
				}
				else if (request?.response?.source?.type !== "ERROR"
				) {
					request.response.source.message = request.i18n.__(request.response.source.type);
				}
			}
			return h.continue;
		});

		
	}
};