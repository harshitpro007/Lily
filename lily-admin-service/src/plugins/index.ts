"use strict";

import * as authToken from "./authToken";
import * as request from "./request";
import * as swagger from "./swagger";

export const plugins = [].concat(authToken, request, swagger);