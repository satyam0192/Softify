
const jwt = require('jsonwebtoken');

function getToken(req) {
    return req.cookies?.token;
}

function authenticate(req, res, next) {
    const token = getToken(req);

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        console.log("Token user:", req.user);

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You don't have access to use this feature"
            });
        }

        next();
    };
}

// Sirf artist ke liye
const authMiddleware = [
    authenticate,
    requireRole('artist')
];

// Normal user aur artist ke liye
const authUser = [
    authenticate,
    requireRole('user', 'artist', 'admin')
];

// Sirf admin ke liye
const authAdmin = [
    authenticate,
    requireRole('admin')
];

module.exports = {
    authenticate,
    requireRole,
    authMiddleware,
    authUser,
    authAdmin
};
