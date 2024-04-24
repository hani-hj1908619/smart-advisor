import jwt from "jsonwebtoken";

export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded;
    } catch (e) {
        return null; //Invalid token
    }
}
