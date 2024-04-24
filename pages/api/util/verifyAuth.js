import {verifyToken} from "./verifyToken";

function isProduction() {
    return process.env.NODE_ENV.toLowerCase() === "production";
}

export function checkAuthorizationHeader(req) {
    if (isProduction() && (!req.headers || !req.headers.authorization)) {
        throw new Error("Unauthorized");
    } else if (isProduction() && req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];

        //return token in case no problems otherwise throw error if token is null or undefined
        return verifyToken(token) ?? (() => {
            throw new Error("Invalid Token");
        })();

    }
}
