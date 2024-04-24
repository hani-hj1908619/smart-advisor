import prisma from "prisma/db"

export async function getPackageCoursesByPackageId(packageId) {
    let courses = await prisma.packageCourse.findMany({
        where: { packageId: packageId },
        include: { course: true }
    })
    courses = courses.map(c => c.course)
    return courses
}