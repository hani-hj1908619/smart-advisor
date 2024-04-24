import prisma from "prisma/db";
import { planFormatter } from "pages/api/util/planFormatters";
import { TokenExpiredError } from "jsonwebtoken";
import { checkAuthorizationHeader } from "../util/verifyAuth";

export default async function handler(req, res) {
  try {
    checkAuthorizationHeader(req);
    const majorId = parseInt(req.query.majorId);

    const plan = await prisma.degreePlan.findMany({
      where: { majorId },
      include: { course: true, package: true, semester: true },
    });

    const maxYear =
      await prisma.$queryRaw`SELECT MAX(year) FROM DegreePlan WHERE majorId=${majorId}`;

    const planArray = await planFormatter(plan, maxYear, null, true);

    res.json(planArray);
  } catch (e) {
    console.log(e);
    const status = e instanceof TokenExpiredError ? 401 : 500;
    const error = status === 401 ? "Unauthorized" : "Internal Server Error";
    res.status(status).json({ error: error, message: e.message });
  }
}
