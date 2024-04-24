import prisma from "prisma/db";
import {
    planFormatter,
    reversePlanFormatter,
} from "pages/api/util/planFormatters";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const userId = parseInt(req.query.userId);

        if (req.method === "GET") {
            const userPlans = await prisma.userPlan.findMany({where: {userId}});

            for await (const plan of userPlans) {
                const dbPlan = await prisma.userPlanCourse.findMany({
                    where: {planId: plan.id},
                    include: {course: true, package: true},
                });

                const maxYear =
                    await prisma.$queryRaw`SELECT MAX(year) FROM UserPlanCourse WHERE planId=${plan.id}`;
                const planArray = await planFormatter(
                    dbPlan,
                    maxYear,
                    plan.startSemesterId
                );
                plan.plan = planArray;
            }
            res.json(userPlans);
        } else if (req.method === "POST") {
            const {plan, ...userPlan} = req.body; // plan is the array of courses
            const createdUserPlan = await prisma.userPlan.create({data: userPlan});

            try {
                // Save the plan details (courses-sem-year)
                const dbData = reversePlanFormatter(createdUserPlan.id, plan, true);
                await prisma.userPlanCourse.createMany({data: dbData});

                const dbPlan = await prisma.userPlanCourse.findMany({
                    where: {planId: createdUserPlan.id},
                    include: {course: true, package: true},
                });
                const maxYear =
                    await prisma.$queryRaw`SELECT MAX(year) FROM UserPlanCourse WHERE planId=${createdUserPlan.id}`;
                const planArray = await planFormatter(
                    dbPlan,
                    maxYear,
                    createdUserPlan.startSemesterId
                );
                createdUserPlan.plan = planArray;

                // Return the created user plan
                res.json(createdUserPlan);
            } catch (e) {
                console.log(e);
                if (createdUserPlan)
                    await prisma.userPlan.delete({where: {id: createdUserPlan.id}});
                res.status(500).send();
            }
        } else return res.status(405).send();
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
