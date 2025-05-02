const authService = require("../services/authService");
const util = require("util");
const db = require("../config/connectToDB");
const dbQuery = util.promisify(db.query).bind(db);
const {
    generateToken,
    generateRefreshToken,
} = require("../services/tokenService");

const register = async (req, res) => {
    try {
        const result = await authService.Register(req, res);
        if (result.success) {
            return res.status(201).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};


const login = async (req, res) => {
    try {
        const result = await authService.Login(
            req.body.username,
            req.body.password
        );
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(401).json(result);
        }
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};
const loginwithToken = async (req, res) => {
    try {
        const result = await authService.LoginWithToken(
            req.body.token,
        );
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(401).json(result);
        }
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: "Server error" });
    }
};
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res
            .status(400)
            .json({ success: false, message: "Refresh token is required" });
    }

    const result = await dbQuery(
        "SELECT * FROM tokens WHERE refresh_token = ?",
        [refreshToken]
    );

    if (result.length === 0) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid refresh token" });
    }

    const user = await dbQuery("SELECT * FROM users WHERE id = ?", [
        result[0].user_id,
    ]);
    if (!user) {
        return res
            .status(401)
            .json({ success: false, message: "User not found" });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken();

    await dbQuery(
        "UPDATE tokens SET refresh_token = ?, token = ? WHERE user_id = ?",
        [newRefreshToken, newToken, user.id]
    );

    return res.json({
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
    });
};

module.exports = { register, login, refreshAccessToken , loginwithToken };
