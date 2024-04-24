const jwt = require("jsonwebtoken");

export function mockJwtToken(user){
    return jwt.sign({
        userId: user.id, name: user.name, gender: user.gender,
    }, process.env.JWT_SECRET_KEY, {expiresIn: "5h"});
}

export function mockVerifyJwt(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        return decoded.userId;
    } catch (e) {
        return null; //Invalid token
    }
}