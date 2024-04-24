import prisma from "prisma/db"

export async function planFormatter(plan, maxYear, startSemesterId, basePlan = false) {
    const planArray = []

    let sems = await prisma.semester.findMany({})
    sems.forEach(sem => { sem.courses = [] });

    if (startSemesterId) {
        const startSemIndex = sems.findIndex(s => s.id == startSemesterId)
        if (startSemIndex) {
            const startSemester = sems.splice(startSemIndex, 1)[0]
            sems.splice(0, 0, startSemester)
        }
    }

    for (const [currentSemIndex, sem] of sems.entries()) {
        if (sem.name.toLowerCase() == "fall") {
            const winterIndex = sems.findIndex(s => s.name.toLowerCase() == "winter")
            if (winterIndex) {
                const winter = sems.splice(winterIndex, 1)[0]
                sems.splice(currentSemIndex + 1, 0, winter)
            }
        }
        else if (sem.name.toLowerCase() == "spring") {
            const summerIndex = sems.findIndex(s => s.name.toLowerCase() == "summer")
            if (summerIndex) {
                const summer = sems.splice(summerIndex, 1)[0]
                sems.splice(currentSemIndex + 1, 0, summer)
            }
        }
    }

    for (let i = 0; i < Object.values(maxYear[0])[0]; i++) {
        const semsCopy = sems.map(sem => ({ ...sem, courses: [] }));
        planArray.push(semsCopy)
    }

    for (const course of plan) {
        // If the formatting is being done on base plan generation
        // Mark all the courses as required for the plan
        // Used to allow deletion of other courses added by students 
        if (basePlan) course.planRequiredCourse = true

        const year = planArray[course.year - 1]

        for (const sem of year) {
            if (sem.id == course.semesterId) {
                sem.courses.push(course)
                break
            }
        }
    }

    return planArray
}

export function reversePlanFormatter(planId, plan, newPlan = false) {
    const planArray = []

    for (const [index, year] of plan.entries()) {
        for (const sem of year) {
            for (const planCourse of sem.courses) {
                const obj = {
                    ...(!newPlan && { id: planCourse.id }),
                    planId,
                    year: index + 1,
                    semesterId: sem.id,
                    courseId: planCourse.courseId,
                    packageId: planCourse.packageId,
                    planRequiredCourse: !!(planCourse.planRequiredCourse)
                }
                planArray.push(obj)
            }
        }
    }
    return planArray
}