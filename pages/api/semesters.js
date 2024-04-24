import prisma from "prisma/db";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "./util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const main = req.query.mainSems;
        let sems;
        if (main) sems = await prisma.semester.findMany({where: {main: true}});
        else sems = await prisma.semester.findMany({});
        res.status(200).json(sems);
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
