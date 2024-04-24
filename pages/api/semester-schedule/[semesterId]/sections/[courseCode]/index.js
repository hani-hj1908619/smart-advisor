import sectionTimingHandler from "pages/api/util/sectionTimingHandler";
import {getTermCoursesByCodeAndCampus} from "repo/termCourseRepo";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const semesterId = parseInt(req.query.semesterId);
        const courseCode = req.query.courseCode.toUpperCase();
        const campus = req.query.campus;

        if (!semesterId || !courseCode || !campus) return res.status(400).send();

        const sections = await getTermCoursesByCodeAndCampus(
            semesterId,
            courseCode,
            campus
        );
        const sectionsWithTimingsCombined = sectionTimingHandler(sections);

        res.json(sectionsWithTimingsCombined);
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
