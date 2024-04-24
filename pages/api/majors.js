import prisma from "prisma/db";
import {withSessionRoute} from "../../utils/withSession";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "./util/verifyAuth";

export default withSessionRoute(handler);

async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const majors = await prisma.major.findMany({});
        res.json(majors);
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
