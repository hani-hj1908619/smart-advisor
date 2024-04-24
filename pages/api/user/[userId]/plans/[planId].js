import prisma from "prisma/db";
import {reversePlanFormatter} from "pages/api/util/planFormatters";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const planId = parseInt(req.query.planId);

        if (req.method === "PUT") {
            const {plan, ...userPlan} = req.body; // plan is the array of courses

            // Update any changes in the plan name, etc
            await prisma.userPlan.update({where: {id: planId}, data: userPlan});

            const oldPlan = await prisma.userPlanCourse.findMany({
                where: {planId},
            });
            const updatedPlan = reversePlanFormatter(planId, plan);

            const oldUserPlanHash = {};
            for (const course of oldPlan) oldUserPlanHash[course.id] = course;

            const updatedUserPlanHash = {};
            for (const course of updatedPlan) updatedUserPlanHash[course.id] = course;

            const dbQueries = [];
            for (const userPlanCourseDbId in oldUserPlanHash) {
                const oldCourse = oldUserPlanHash[userPlanCourseDbId];
                const updatedCourse = updatedUserPlanHash[userPlanCourseDbId];

                if (!updatedCourse) {
                    const query = prisma.userPlanCourse.delete({
                        where: {id: parseInt(userPlanCourseDbId)},
                    });
                    dbQueries.push(query);
                } else if (
                    oldCourse.year !== updatedCourse.year ||
                    oldCourse.semesterId !== updatedCourse.semesterId ||
                    oldCourse.courseId !== updatedCourse.courseId
                ) {
                    const query = prisma.userPlanCourse.update({
                        where: {id: parseInt(userPlanCourseDbId)},
                        data: updatedCourse,
                    });
                    dbQueries.push(query);
                }
            }

            for (const userPlanCourseDbId in updatedUserPlanHash) {
                const oldCourse = oldUserPlanHash[userPlanCourseDbId];
                const updatedCourse = updatedUserPlanHash[userPlanCourseDbId];

                if (!oldCourse) {
                    const query = prisma.userPlanCourse.create({data: updatedCourse});
                    dbQueries.push(query);
                }
            }

            await prisma.$transaction(dbQueries);
            res.status(200).send("OK");
        } else if (req.method === "DELETE") {
            await prisma.$transaction([
                prisma.userPlanCourse.deleteMany({where: {planId}}),
                prisma.userPlan.deleteMany({where: {id: planId}}),
            ]);
            res.status(200).send("OK");
        }
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
