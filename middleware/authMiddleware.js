const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");

dotenv.config();

const secret = process.env.JWT_SECRET

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'missing token' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded.id;
        next(); // token ok!
    } catch (err) {
        res.status(403);
        res.json({ message: 'invalid or expired token' });
    }
}

module.exports = requireAuth;