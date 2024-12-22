import { MESSAGES } from "@config/main.constant";

export class APIResponse {//NOSONAR

  /**
   * @description you can un comment time as according to your need
   * type is also deleted according to the need
   */
  constructor(result: any) {
    let self: any = {};

    if (typeof result === "object" && result.hasOwnProperty("statusCode") && result.hasOwnProperty("message")) {
      result ? self = result : "";//NOSONAR
    } else {
      self = MESSAGES.SUCCESS.DEFAULT;
      result ? self.data = result : "";//NOSONAR
    }
    return self;//NOSONAR
  }
}
