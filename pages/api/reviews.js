import prisma from "prisma/db";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "./util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        if (req.method === "GET") {
            const userId = parseInt(req.query.userId);
            const instructorId = parseInt(req.query.instructorId);
            const courseId = parseInt(req.query.courseId);

            let reviews;
            if (userId)
                reviews = await prisma.review.findMany({
                    where: {userId},
                    include: {instructor: true, course: true},
                });
            else if (instructorId)
                reviews = await prisma.review.findMany({
                    where: {instructorId},
                    include: {instructor: true, course: false},
                });
            else if (courseId)
                reviews = await prisma.review.findMany({
                    where: {courseId},
                    include: {instructor: false, course: true},
                });
            else
                reviews = await prisma.review.findMany({
                    include: {instructor: true, course: true},
                });
            res.json(reviews);
        } else if (req.method === "POST") {
            const reviewObject = req.body;
            await prisma.review.createMany({data: reviewObject});
            res.status(200).send();
        } else res.status(405).end("Method not allowed");
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
