import { readFile } from "fs";
import { Request } from "@hapi/hapi";
import { promisify } from "util";
import { MESSAGES, USER_TYPE, SERVER } from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { logger } from "@lib/logger";
const Jwt = require('jsonwebtoken');

function readPrivateKey(): Promise<string> {
	return promisify(readFile)(SERVER.JWT_PRIVATE_KEY, "utf8");
}

function readPublicKey(): Promise<string> {
	return promisify(readFile)(SERVER.JWT_PUBLIC_KEY, "utf8");
}

function readPrivateKeyRefrehToken(): Promise<string> {
	return promisify(readFile)(SERVER.JWT_PRIVATE_KEY_REFRESH, "utf8");
}

function readPublicKeyRefrehToken(): Promise<string> {
	return promisify(readFile)(SERVER.JWT_PUBLIC_KEY_REFRESH, "utf8");
}

const encode = async function (payload: JwtPayload): Promise<string> {
	const cert = await readPrivateKey();
	if (!cert) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
	if (payload.exp) payload.exp = Math.floor((Date.now() + payload.exp) / 1000);
	if (payload.deviceId === "") delete payload.deviceId;
	return await Jwt.sign(payload, cert, { algorithm: SERVER.JWT_ALGO });
};

const encodeRefreshToken = async function (payload: JwtPayload): Promise<Object> {
	const cert = await readPrivateKeyRefrehToken();
	if (!cert) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
	if (payload.exp) payload.exp = Math.floor((Date.now() + payload.exp) / 1000);
	if (payload.deviceId === "") delete payload.deviceId;
	const refreshToken = await Jwt.sign(payload, cert, { algorithm: SERVER.JWT_ALGO  });
	console.log("refreshToken:::: ",refreshToken)
	return refreshToken
};
/**
 * @description This method checks the token and returns the decoded data when token is valid in all respect
 */
const validate = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		const cert = await readPublicKey();
		return await Jwt.verify(token, cert);

	} catch (error) {
		console.log("--------------error",error)

		if (error && error.name === "TokenExpiredError" && auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
		if (error && error.name === "TokenExpiredError" && !auth) return Promise.reject(MESSAGES.ERROR.TOKEN_EXPIRED);
		// throws error if the token has not been encrypted by the private key
		if(error && error.name === "JsonWebTokenError"  && !auth ) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
		console.log(error.name,"***************************")
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};

const validateRefrehToken = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		const cert = await readPublicKeyRefrehToken();
		return await Jwt.verify(token, cert);

	} catch (error) {

		if (error && error.name === "TokenExpiredError" && auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.SESSION_EXPIRED));
		if (error && error.name === "TokenExpiredError" && !auth) return Promise.reject(MESSAGES.ERROR.TOKEN_EXPIRED);
		// throws error if the token has not been encrypted by the private key
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};
/**
 * @description This method checks the token and returns the decoded data when token is valid in all respect
 */
const validateAdmin = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		const cert = await readPublicKey();
		return await Jwt.verify(token, cert);

	} catch (error) {
		if (error && error.name === "TokenExpiredError" && auth) return Promise.reject(MESSAGES.ERROR.SESSION_EXPIRED);
		if (error && error.name === "TokenExpiredError" && !auth) return Promise.reject(MESSAGES.ERROR.TOKEN_EXPIRED);
		// throws error if the token has not been encrypted by the private key
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};
/**
 * @description Returns the decoded payload if the signature is valid even if it is expired
 */
const decode = async function (token: string, request?: Request, auth: boolean = true): Promise<JwtPayload> {
	try {
		console.log(token,"tokentokentokentoken")
		const cert = await readPublicKey();
		return await Jwt.verify(token, cert, { ignoreExpiration: true })

	} catch (error) {
		logger.error(error);
		if (error?.name && auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
		if (error?.name && !auth) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
		return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
	}
};



const createToken = async (
	data: {
		userId: string,
		deviceId?: string,
		accessTokenKey: string,
		type: string,
		userType: string
	}
): Promise<string> => {
	const accessToken = await encode({
		iss: SERVER.APP_URL,
		aud: data.userType,
		sub: data.userId.toString(),
		deviceId: data.deviceId,
		iat: Math.floor(Date.now() / 1000),
		exp: SERVER.TOKEN_INFO.EXPIRATION_TIME[data.type],
		prm: data.accessTokenKey
	});

	if (!accessToken) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);

	return accessToken;
};

const createTokenRefreshToken = async (
	data: {
		userId: string,
		deviceId?: string,
		accessTokenKey: string,
		type: string,
		userType: string,
	}
): Promise<string> => {
	const refreshToken:any = await encodeRefreshToken({
		iss: SERVER.TOKEN_INFO.ISSUER,
		aud: data.userType,
		sub: data.userId.toString(),
		deviceId: data.deviceId,
		iat: Math.floor(Date.now() / 1000),
		exp: SERVER.TOKEN_INFO.EXPIRATION_TIME.REFRESH_TOKEN,
		prm: data.accessTokenKey,
	});

	if (!refreshToken) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
	return refreshToken;
};

const createAdminAccessToken = async(data) : Promise<string> => {
	const accessToken = await encode({
		iss: SERVER.APP_URL,
		aud: data.userType,
		sub: data.userId.toString(),
		deviceId: data.deviceId,
		iat: Math.floor(Date.now() / 1000),
		exp: SERVER.TOKEN_INFO.EXPIRATION_TIME[data.type],
		prm: data.accessTokenKey,
		role : data.role ? data.role : ""
	})
	console.log({accessToken});
	if(!accessToken) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
	return accessToken;
}

const validateTokenData = async (payload: JwtPayload, request?: Request, auth: boolean = true): Promise<boolean> => {
	if (
		!payload?.iss ||
		!payload?.aud ||
		!payload?.sub ||
		!payload?.prm ||
		[USER_TYPE.USER, USER_TYPE.ADMIN, USER_TYPE.PROVIDER, USER_TYPE.DOCTOR, USER_TYPE.NURSE, USER_TYPE.STAFF].indexOf(payload.aud) === -1
	) {
		if (auth) return Promise.reject(responseHandler.sendError(request, MESSAGES.ERROR.BAD_TOKEN));
		if (!auth) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
	}
	console.log("RETURNING TRUE")
	return true;
};


const createVerificationToken = async function (data: VerificationToken): Promise<string> {
	const payload = {
		iss: data.email,
		sub : data.userId,
		iat : Math.floor(Date.now() / 1000),
		exp : data.exp,
		type: data.type
	}
	const cert = await readPrivateKey();
	if (!cert) return Promise.reject(MESSAGES.ERROR.TOKEN_GENERATE_ERROR);
	if (payload.exp) payload.exp = payload.iat + payload.exp;
	return await Jwt.sign(payload, cert, { algorithm: SERVER.JWT_ALGO });
};

/**
 * @description Returns the decoded payload if the signature is valid even if it is expired
 */
const decodeVerificationToken = async function (token: string): Promise<VerificationToken> {
	try {
		const cert = await readPublicKey();
		return await Jwt.verify(token, cert, { ignoreExpiration: true })

	} catch (error) {
		logger.error(error);
		return Promise.reject(responseHandler.sendError({},MESSAGES.ERROR.BAD_TOKEN));
	}
};

export {
	encode,
	validate,
	decode,
	createToken,
	validateTokenData,
	validateAdmin,
	createVerificationToken,
	decodeVerificationToken,
	createAdminAccessToken,
	createTokenRefreshToken,
	validateRefrehToken
};