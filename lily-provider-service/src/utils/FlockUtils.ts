"use strict";

import axios from "axios";

import { SERVER } from "@config/environment";

const sendMessageToFlock = async (error: { title: string, error: any, request?: any }) => {
	if (SERVER.ENVIRONMENT !== "localhost") {
		let formatedMessage = `<flockml><strong>${SERVER.ENVIRONMENT.toUpperCase()} : ${error.title}</strong></br>`;
		if (error?.request) {
			const path = `${"Request Path=======>"}</strong> ${error.request?.method.toUpperCase() + " " + error.request?.path}</br>`;
			const body = `${"Request Body=======>"}</strong> ${JSON.stringify(error.request?.payload)}</br>`;
			const params = `${"Request Params=====>"}</strong> ${JSON.stringify(error.request?.params)}</br>`;
			const query = `${"Request Query======>"}</strong> ${JSON.stringify(error?.request?.query)}</br>`;
			const authorization = `${"Authorization=======>"}</strong> ${error.request?.headers?.authorization}</br>`;
			const platform = `${"platform===========>"}</strong> ${error.request?.headers?.platform}</br>`;
			formatedMessage += path + body + params + query + authorization + platform;
		}
		formatedMessage += `${typeof error.error == "object" ? JSON.stringify(error.error) : error.error}</flockml>`;

		const response = await axios.post(`${SERVER.FLOCK_URL}`,
			JSON.stringify({ flockml: formatedMessage }),
			{
				headers: {
					"Content-Type": "application/json"
				}
			});

		return response.data.data ? response.data.data : response.data;
	}else{
		return;
	}
};

export {
	sendMessageToFlock
};