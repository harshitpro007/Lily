"use strict";

import _ from "lodash";
import Boom from "boom";
import { ResponseToolkit } from "@hapi/hapi";

import { APIResponse } from "@utils/APIResponse";
import { logger } from "@lib/logger";
import { sendMessageToFlock } from "@utils/FlockUtils";

export class ResponseHandler {


	_sendResponse(h: any, result: any) {
		// send status code 200 and 201
		return h.response(result).code(result.statusCode);
	}

	sendError(request: any, error: any) {
		if (!error.statusCode) {
			logger.error("Unhandled error=======>", error);
			sendMessageToFlock({ "title": "Unhnadled Error", "error": error.stack, request });
		}
		let errorToSend;
		if (error.statusCode) { // handled error
			if (
				!_.isEmpty(request) &&
				error.type !== "ERROR" &&
				error.type !== "TOKEN_GENERATE_ERROR" &&
				error.type !== "FIELD_REQUIRED"
			) {
				error.message = request.i18n.__(error.type);
			}
			if (!error.output) {
				errorToSend = Boom.badRequest(error);
				errorToSend.output.statusCode = error.statusCode;
				errorToSend.output.payload = {
					...error
				};
			} else {
				errorToSend = Boom.badRequest(errorToSend);
				errorToSend.output.statusCode = error.output.statusCode;
				errorToSend.output.payload = {
					...error.output.payload
				};
			}
		} else { // unhaldled error
			errorToSend = Boom.badRequest(error);
		}
		return errorToSend;
	}

	sendSuccess(request,h: ResponseToolkit, result: any) {
			result.message = request.i18n.__(result.type);
		result = new APIResponse(result);
		return this._sendResponse(h, result);
	}
}

export const responseHandler = new ResponseHandler();