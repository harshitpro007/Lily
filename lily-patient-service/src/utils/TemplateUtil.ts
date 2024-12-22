
import fs from "fs";
import handlebars from "handlebars";

import { SERVER } from "@config/environment";

handlebars.registerHelper("hasName", function (value) {
	return value;
});

export class TemplateUtil {

	private template: string;

	constructor(template) {
		this.template = template;
	}

	compileFile(complieData: Object) {
		return new Promise((resolve, reject) => {
			complieData["year"] = new Date().getFullYear();
			complieData["appLogo"] = SERVER.APP_LOGO;
			fs.readFile(this.template, "utf8", (error, content) => {
				if (error)
					reject(error);
				try {
					const template = handlebars.compile(content);
					const html = template(complieData);
					resolve(html);
				} catch (error) {
					reject(error);
				}
			});
		});
	}
}