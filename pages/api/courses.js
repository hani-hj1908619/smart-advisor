import {
    getCourseByCode,
    getCourseById,
    getCourseByTitle,
} from "repo/courseRepo";
import {getPackageCoursesByPackageId} from "repo/packageRepo";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "./util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const courseCode = req.query.code;
        const courseTitle = req.query.title;
        const packageId = parseInt(req.query.packageId);
        const courseId = parseInt(req.query.courseId);

        if (!(packageId || courseCode || courseId || courseTitle))
            return res.status(400).send();

        let courses = [];

        if (courseCode) courses = await getCourseByCode(courseCode.toUpperCase());
        else if (courseId) courses = await getCourseById(courseId);
        else if (packageId) courses = await getPackageCoursesByPackageId(packageId);
        else if (courseTitle) courses = await getCourseByTitle(courseTitle);

        res.json(courses);
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
