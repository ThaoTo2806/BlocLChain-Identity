const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

exports.generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};
