import prisma from "prisma/db"

export async function getTermCoursesByCodeAndCampus(termId, courseCode, campus) {
    const sections = await prisma.termCourse.findMany({
        where: {
            termId, campus,
            course: { code: courseCode }
        },
        include: { course: true, instructor: true }
    })

    return sections
}