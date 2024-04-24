import prisma from "prisma/db";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const userId = parseInt(req.query.userId);

        if (req.method === "GET") {
            const userGrades = await prisma.userGrade.findMany({
                where: {userId},
                include: {
                    termCourse: {
                        include: {course: true, instructor: true},
                    },
                },
            });
            res.json(userGrades);
        } else res.status(405).send();
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
