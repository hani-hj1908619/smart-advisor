import prisma from "../../../prisma/db";
import { withSessionRoute } from "../../../utils/withSession";
import bcrypt from "bcryptjs";


export default withSessionRoute(handler);

export async function handler(req, res) {

    if (req.method !== "POST") return res.status(405).end("Method not allowed");

    try {
        const { body } = req
        body.id = parseInt(body.id)

        const hash = await bcrypt.hash(body.password, 10)

        if (hash) {
            body.password = hash

            const user = await prisma.user.create({ data: body })
            if (!user) return res.status(500).end()

            res.status(200).send('success')
        }

    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
}
