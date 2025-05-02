const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message:
                        err.name === "TokenExpiredError"
                            ? "TOKEN_EXPIRED"
                            : "Invalid token",
                });
            }

            req.user = decoded;
            next();
        });
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

module.exports = verifyToken;
