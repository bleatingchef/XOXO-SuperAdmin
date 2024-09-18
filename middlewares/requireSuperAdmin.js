const requireSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next(); // User is super admin, proceed to the next middleware
    } else {
        return res.status(403).json({
            message: 'Access denied, you must be a super admin',
            success: false,
        });
    }
};

module.exports=requireSuperAdmin;