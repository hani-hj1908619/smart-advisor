import prisma from "prisma/db";
import {TokenExpiredError} from "jsonwebtoken";
import {checkAuthorizationHeader} from "../../util/verifyAuth";

export default async function handler(req, res) {
    try {
        checkAuthorizationHeader(req);
        const userId = parseInt(req.query.userId);

        if (req.method === "GET") {
            const userTodos = await prisma.todo.findMany({where: {userId}});
            res.json(userTodos);
        } else if (req.method === "POST") {
            const todo = await prisma.todo.create({data: req.body});
            res.status(200).send(todo.id);
        } else if (req.method === "PUT") {
            await prisma.todo.update({
                where: {id: req.body.id},
                data: req.body,
            });
            res.status(200).send();
        } else if (req.method === "DELETE") {
            await prisma.todo.delete({where: {id: req.body.id}});
            res.status(200).send();
        } else res.status(405).send();
    } catch (e) {
        console.log(e);
        const status = e instanceof TokenExpiredError ? 401 : 500;
        const error = status === 401 ? "Unauthorized" : "Internal Server Error";
        res.status(status).json({error: error, message: e.message});
    }
}
