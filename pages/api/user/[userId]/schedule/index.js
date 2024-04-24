import sectionTimingHandler from "pages/api/util/sectionTimingHandler";
import prisma from "prisma/db";
import { TokenExpiredError } from "jsonwebtoken";
import { checkAuthorizationHeader } from "../../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const userId = parseInt(req.query.userId);
        const joinYear = req.query.joinYear

        let userSchedule = await prisma.userSchedule.findMany({
            where: { userId },
            include: {
                course: true,
                termCourse: true,
            },
            orderBy: [
                { course: { code: "asc" } },
                { termCourse: { sectionNo: "desc" } },
            ],
        });

        userSchedule = userSchedule.map((s) => {
            return { course: s.course, section: s.termCourse };
        });

        if (req.method === "GET") {
            let scheduleOutdated = false;

            // Check if saved schedule is outdated
            if (userSchedule.length) {
                // TODO: Get current term
                const currentTerm = { id: 201910, year: 2019, semesterId: 10 };
                const year = ((new Date().getFullYear() - parseInt(joinYear)) + 1)

                // Get course list from sem in user's main plan
                let mainPlanCourses = await prisma.userPlanCourse.findMany({
                    where: {
                        userPlan: { userId, mainPlan: true },
                        year,
                        semesterId: currentTerm.semesterId,
                    },
                    include: { course: true },
                });

                // Using course code instead of ID to compare
                // main plan does not have a separate course for linked labs
                // schedule has dedicated section/course object for linked labs
                // can be seen as a difference when comparing
                mainPlanCourses = mainPlanCourses.map((p) => {
                    if (!p.course) {
                        scheduleOutdated = true;
                        return null;
                    } else return p.course.code;
                });
                const savedSchedCourses = userSchedule.map((s) => s.course.code);

                let diff = [];
                diff = mainPlanCourses.filter(
                    (value) => !savedSchedCourses.includes(value)
                );
                if (!diff.length)
                    diff = savedSchedCourses.filter(
                        (value) => !mainPlanCourses.includes(value)
                    );
                if (diff.length) scheduleOutdated = true;
            }

            // Get all different timings for the same section
            let tempUserSchedule = [];

            for (const scheduleCourse of userSchedule) {
                if (scheduleCourse.section) {
                    const allSectionTimings = await prisma.termCourse.findMany({
                        where: {
                            crn: scheduleCourse.section.crn,
                            termId: scheduleCourse.section.termId,
                        },
                        include: { course: true, instructor: true },
                    });

                    const sectionUpdated = sectionTimingHandler(allSectionTimings)[0];
                    const { course, ...section } = sectionUpdated;
                    tempUserSchedule.push({ course, section });
                } else tempUserSchedule.push({ course: scheduleCourse.course });
            }
            userSchedule = tempUserSchedule;

            res.json({ schedule: userSchedule, scheduleOutdated });
        } else if (req.method === "POST") {
            const { schedule } = req.body;

            // Compare old and new schedules
            const removed = [];
            const addData = [];
            const updateQueries = [];

            for (const scheduleCourse of userSchedule) {
                const matchingObj = schedule.find(
                    (s) => s.course.id === scheduleCourse.course.id
                );
                if (matchingObj) {
                    const section1 = scheduleCourse.section;
                    const section2 = matchingObj.section;

                    if (
                        (section1 && !section2) ||
                        (!section1 && section2) ||
                        (section1 && section2 && section1.crn !== section2.crn)
                    ) {
                        updateQueries.push(
                            prisma.userSchedule.updateMany({
                                where: {
                                    AND: {
                                        userId,
                                        courseId: matchingObj.course.id,
                                    },
                                },
                                data: {
                                    termCourseId: matchingObj.section
                                        ? matchingObj.section.id
                                        : null,
                                },
                            })
                        );
                    }
                } else removed.push(scheduleCourse.course.id);
            }

            for (const scheduleCourse of schedule) {
                const matchingObj = userSchedule.find(
                    (s) => s.course.id === scheduleCourse.course.id
                );
                if (!matchingObj) {
                    addData.push({
                        userId,
                        courseId: scheduleCourse.course.id,
                        ...(scheduleCourse.section && {
                            termCourseId: scheduleCourse.section.id,
                        }),
                    });
                }
            }

            if (removed.length)
                await prisma.userSchedule.deleteMany({
                    where: {
                        userId,
                        courseId: { in: removed },
                    },
                });

            if (addData.length)
                await prisma.userSchedule.createMany({ data: addData });

            if (updateQueries.length) await prisma.$transaction(updateQueries);

            res.status(200).send("OK");
        } else res.status(501).send();
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({ error: error, message: e.message });
    }
}
