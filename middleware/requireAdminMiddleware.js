const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: "Admins only" });
    }

    next();
};

module.exports = requireAdmin;