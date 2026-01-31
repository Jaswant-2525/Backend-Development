import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const actualToken = token.split(" ")[1]; 
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET); 
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { 
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized` 
            });
        }
        next();
    };
};