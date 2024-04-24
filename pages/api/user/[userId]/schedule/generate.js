import sectionTimingHandler from "pages/api/util/sectionTimingHandler";
import prisma from "prisma/db";
import { TokenExpiredError } from "jsonwebtoken";
import { checkAuthorizationHeader } from "../../../util/verifyAuth";
import { checkSectionConflict, sectionTimeCompareFn } from "utils/common";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);

        const userId = parseInt(req.query.userId);
        const includeFull = req.query.includeFull === "true";
        const timings = req.query.timings
        const gender = req.query.gender
        const joinYear = req.query.joinYear

        // TODO: Get current term - fetch here
        const currentTerm = { id: 201910, year: 2019, semesterId: 10 }
        const year = ((new Date().getFullYear() - parseInt(joinYear)) + 1)

        // Get course list from sem in user's main plan
        const mainPlanCourses = await prisma.userPlanCourse.findMany({
            where: {
                userPlan: { userId, mainPlan: true },
                year,
                semesterId: currentTerm.semesterId,
            },
            include: { course: true, package: true },
        });

        if (!mainPlanCourses.length) {
            // Main plan not set
            return res.status(200).send({ error: "noPlan" });
        }

        const campus = gender.toLowerCase();

        const mainPlanCourseIds = [];
        const mainPlanLinkedLabCourseCodes = [];

        for (const planCourse of mainPlanCourses) {
            const course = planCourse.course;

            if (course) {
                mainPlanCourseIds.push(course.id);
                if (course.linkedLab) mainPlanLinkedLabCourseCodes.push(course.code);
            } else {
                // Package course - force to select course for package from plan page before scheduling
                return res.status(200).send({
                    error: "package",
                    errorDesc: `No course selected for package ${planCourse.package.name}.`,
                });
            }
        }

        let andCondition = {
            campus,
            termId: currentTerm.id,
            meetingTimeStart: { not: ":" }, //avoids sections with no timing set yet
        }

        if (!includeFull) {
            andCondition = {
                ...andCondition,
                seatsCurrent: { lt: prisma.termCourse.fields.seatsTotal }
            }
        }

        let sections = await prisma.termCourse.findMany({
            where: {
                OR: [
                    { courseId: { in: mainPlanCourseIds } },
                    { course: { code: { in: mainPlanLinkedLabCourseCodes } } },
                ],
                AND: andCondition,
            },
            include: { course: true, instructor: true },
        });

        for (const planCourse of mainPlanCourses) {
            if (!planCourse.package)
                continue

            const packageSections = sections.some(section => section.courseId === planCourse.courseId)
            //
            if (!packageSections)
                return res.status(200).send({
                    error: "package",
                    errorDesc: `No sections found for ${planCourse.course.code} - ${planCourse.course.title}.`,
                });
        }

        sections = sectionTimingHandler(sections);

        sections = sections.reduce((acc, curr) => {
            const courseSections = acc[curr.courseId]
            courseSections ? courseSections.push(curr) : acc[curr.courseId] = [curr]
            return acc;
        }, {});

        if (timings) {
            for (const sectionList of Object.values(sections)) {
                if (timings.toLowerCase() == "early") sectionList.sort(sectionTimeCompareFn)
                else if (timings.toLowerCase() == "late") sectionList.sort((a, b) => sectionTimeCompareFn(b, a))
            }
        }

        // console.time('generateSchedule');
        const validSchedules = generateSchedule(sections)
        // console.timeEnd('generateSchedule');
        // console.log("Calculated schedules: ", validSchedules.length);

        if (!validSchedules.length)
            return res.status(200).send({
                error: "notPossible",
                errorDesc: `No possible combination found for the current semester plan.`,
            });

        const generatedSchedule = validSchedules[0].map((s) => {
            const { course, ...section } = s
            return { course, section }
        })

        res.status(200).json(generatedSchedule);
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({ error: error, message: e.message });
    }
}


function generateSchedule(courseSections) {
    const validSchedules = [];
    const schedule = [];

    function hasConflict(newSection) {
        for (const existingSection of schedule) {
            if (checkSectionConflict(newSection, existingSection)) {
                return true; // Time conflict found
            }
        }

        return false; // No conflict found
    }

    function backtrack(schedule, courseSections) {
        if (Object.keys(courseSections).length === 0) {
            validSchedules.push([...schedule]);
            return;
        }

        const courseID = Object.keys(courseSections)[0];
        const sections = courseSections[courseID];

        for (const section of sections) {
            if (hasConflict(section)) continue;

            schedule.push(section);
            const remainingCourseSections = { ...courseSections };
            delete remainingCourseSections[courseID];

            backtrack(schedule, remainingCourseSections);

            schedule.pop();
        }
    }

    backtrack(schedule, courseSections);
    return validSchedules;
}