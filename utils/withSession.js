// lib/withSession.js

import {withIronSessionApiRoute, withIronSessionSsr} from "iron-session/next";

const sessionOptions = {
    password: "5bCmr1qWBFE1hfUQva95x1zDHk11qHMA",
    cookieName: "session",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
        secure: process.env.NODE_ENV.toLowerCase() === 'production',
    },
};

export function withSessionRoute(handler) {
    return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr(handler) {
    return withIronSessionSsr(handler, sessionOptions);
}