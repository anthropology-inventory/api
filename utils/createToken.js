const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

const MAX_AGE = 1 * 24 * 60 * 60 // 1 day

const secret = process.env.JWT_SECRET

const createToken = (id, isAdmin) => {
    return jwt.sign({ id, isAdmin }, secret, {
        expiresIn: MAX_AGE
    });
}

module.exports = createToken;