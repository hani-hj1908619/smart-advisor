import prisma from "prisma/db"

export async function getCourseByCode(courseCode) {
    const courses = await prisma.course.findMany({
        where: { code: courseCode },
        include: { college: true, department: true }
    })
    return courses
}

export async function getCourseById(courseId) {
    const courses = await prisma.course.findUnique({
        where: { id: courseId },
        include: { college: true, department: true }
    })

    return courses
}

export async function getCourseByTitle(courseTitle) {
    const courses = await prisma.course.findMany({
        where: { title: { contains: courseTitle } },
        include: { college: true, department: true }
    })

    return courses
}