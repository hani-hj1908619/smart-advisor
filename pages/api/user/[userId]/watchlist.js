import prisma from "prisma/db";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const userId = parseInt(req.query.userId);

        if (req.method === "GET") {
            const userWatchlist = await prisma.courseWatchlist.findMany({
                where: {userId},
                include: {course: true},
            });
            res.json(userWatchlist);
        } else if (req.method === "PUT") {
            const {termId, courseId} = req.body;
            await prisma.courseWatchlist.create({
                data: {userId, termId, courseId},
            });
            res.status(200).send();
        } else if (req.method === "DELETE") {
            if (req.body.deleteAll)
                await prisma.courseWatchlist.deleteMany({where: {userId}});
            else await prisma.courseWatchlist.delete({where: {id: req.body.id}});
            res.status(200).send();
        } else res.status(405).send();
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
