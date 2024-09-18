const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Format: 'Bearer <token>'

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized, JWT Token is required",
            success: false,
            code: 401
        });
    }   

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        console.log("Authenticated user:", req.user); // Debugging line
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized, JWT Token is invalid or expired",
            success: false,
            code: 401
        });
    }
};


module.exports = ensureAuthenticated;
