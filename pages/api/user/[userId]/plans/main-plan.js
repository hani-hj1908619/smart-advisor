import prisma from "prisma/db";
import {planFormatter} from "pages/api/util/planFormatters";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const userId = parseInt(req.query.userId);

        if (req.method === "GET") {
            const mainUserPlan = await prisma.userPlan.findFirst({
                where: {userId, mainPlan: true},
            });

            if (!mainUserPlan) return res.json(mainUserPlan);

            const dbPlan = await prisma.userPlanCourse.findMany({
                where: {planId: mainUserPlan.id},
                include: {course: true, package: true},
            });

            const maxYear =
                await prisma.$queryRaw`SELECT MAX(year) FROM UserPlanCourse WHERE planId=${mainUserPlan.id}`;
            const planArray = await planFormatter(
                dbPlan,
                maxYear,
                mainUserPlan.startSemesterId
            );
            mainUserPlan.plan = planArray;

            res.json(mainUserPlan);
        } else if (req.method === "PUT") {
            const {planId} = req.body;

            // set old main plan to false and new main plan to true
            await prisma.$transaction([
                prisma.userPlan.updateMany({
                    data: {mainPlan: false},
                    where: {userId, mainPlan: true},
                }),
                prisma.userPlan.update({
                    data: {mainPlan: true},
                    where: {id: planId},
                }),
            ]);

            res.status(200).send();
        }
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
