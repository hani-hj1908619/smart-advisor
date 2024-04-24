import prisma from "prisma/db";
import { withSessionRoute } from "utils/withSession";

import bcrypt from "bcryptjs";
import { TokenExpiredError } from "jsonwebtoken";
import { setCookie } from "nookies";
import { verifyToken } from "../util/verifyToken";

const jwt = require("jsonwebtoken");


export default withSessionRoute(handler);

export async function handler(req, res) {
    if (req.method !== "POST" && req.method !== "DELETE") return res.status(405).end("Method not allowed");

    try {
        let responseJson = {}
        let status = 200

        if (req.method === 'POST') {
            const { body } = req

            const user = await prisma.user.findUnique({
                where: { id: parseInt(body.id) }, include: { college: true, major: true },
            });

            if (!user) return res.status(404).end()

            const token = jwt.sign({
                userId: user.id, name: user.name, gender: user.gender,
            }, process.env.JWT_SECRET_KEY, { expiresIn: "5h" });


            const match = await bcrypt.compare(body.password.trim(), user.password)
            if (match) {
                //storing user id in session cookie.
                const { id: userId } = user;
                req.session.user = {
                    id: userId,
                    joinYear: user.joinYear,
                    gender: user.gender
                };
                setCookie({ res }, "userSession",
                    JSON.stringify({ userToken: token, name: user.name }), {
                    maxAge: 30 * 24 * 60 * 60,
                    path: "/",
                    secure: process.env.NODE_ENV.toLowerCase() === "production",
                });

                await req.session.save();

                responseJson = {
                    userToken: token, name: user.name, major: user.major.name, college: user.college.name,
                }
                return res.status(status).json(responseJson)
            } else {
                status = 401;
            }//user does not exist
        } else if (req.method === 'DELETE') {
            const token = req.headers.authorization?.split(" ")[1];
            const decoded = verifyToken(token);

            req.session.destroy();
            responseJson = { ok: true }
            status = 200
        }

        (status === 401 ? res.status(status).end('Unauthorized') : res.status(status).json(responseJson))
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({ error: error, message: e.message });
    }
}
