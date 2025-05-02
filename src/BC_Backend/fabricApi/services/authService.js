const { Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const { sendEmail } = require("../utils/mailSender");
const jwt = require("jsonwebtoken");


const db = require("../config/connectToDB");
const { constrainedMemory } = require("process");
const util = require("util");
const dbQuery = util.promisify(db.query).bind(db);
const { generateToken, generateRefreshToken } = require("./tokenService");

require("dotenv").config();
async function Login(username, password) {
    try {
        const ca = new FabricCAServices(process.env.fabric_url);
        const walletPath = path.join(__dirname, "../../wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const result = await dbQuery("SELECT * FROM users WHERE username = ?", [
            username,
        ]);

        if (result.length === 0) {
            return {
                message: "User not found",
                data: { code: "USER_NOT_FOUND", success: false },
            };
        }

        const userRecord = result[0];

        // Kiểm tra mật khẩu
        if (password !== userRecord.enrollment_secret) {
            return {

                message: "Invalid credentials",
                data: { code: "INVALID_CREDENTIALS", success: false },
            };
        }

        // Kiểm tra danh tính trong wallet
        const identity = await wallet.get(username);

        // Tạo JWT Token
        const token = generateToken(userRecord);
        const refreshToken = generateRefreshToken();

        await dbQuery(
            "INSERT INTO tokens (user_id, token, refresh_token, expires_at) VALUES (?, ?, ?, ?)",
            [
                userRecord.id,
                token,
                refreshToken,
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ]
        );

        return {
            message: "Login successful",
            data: {
                username: userRecord.username,
                common_name: userRecord.common_name,
                role: userRecord.role,
                token,
                refreshToken,
                code: "LOGIN_SUCCESS",
                success: true,
                id : userRecord.id,
            },
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            success: false,
            code: "SERVER_ERROR",
            message: "Server error",
        };
    }
}

async function LoginWithToken(token) {
    try {
        
        const sql = `SELECT users.* FROM degrees INNER JOIN users ON degrees.user_id = users.id WHERE degrees.hash_qrcode = ?`;
        const [rows] = await dbQuery(sql, [token]);
    
        if (!rows || rows.length === 0) {
            return {code : "INVALID_CREDENTIALS",  success: false, message: "Mã token không hợp lệ" };
        }
        const user = rows;
        if(!user.pin_code && user.role !== "admin" && user.role !== "manager"){
            return { code : "PIN_REQUIRED", success: false, message: "Pin code yêu cầu" };
        }
        return {
             code : "LOGIN_SUCCESS",
            success: true,
            message: "Đăng nhập thành công",
            user,
            token
        };
    } catch (error) {
        console.error("Lỗi khi đăng nhập bằng token:", error);
        return { success: false, message:error };
    }

}

async function Register(req) {
    const {
        username,
        email,
        citizen_id,
        common_name,
        organization,
        organizational_unit,
        country,
        state,
        locality,
        role,
        dob, // ngày sinh
    } = req.body;

    let wallet;
    let walletPath;

    try {
        console.log("Fabric CA URL:", process.env.fabric_url);
        const ca = new FabricCAServices(process.env.fabric_url);
        walletPath = path.resolve(__dirname, "../../wallet");
        console.log(`Wallet path: ${walletPath}`);
        wallet = await Wallets.newFileSystemWallet(walletPath);

        // Kiểm tra quyền hợp lệ
        const validRoles = ["user", "admin"];
        if (!validRoles.includes(role)) {
            return {
                success: false,
                message:
                    "Invalid role. Allowed roles: user, admin",
            };
        }

        // Kiểm tra username, email, citizen_id đã tồn tại chưa
        const checkUserSQL =
            "SELECT * FROM users WHERE username = ? OR email = ? OR citizen_id = ?";
        const existingUser = await new Promise((resolve, reject) => {
            db.query(
                checkUserSQL,
                [username, email, citizen_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        if (existingUser.length > 0) {
            return {
                success: false,
                message: "Username, email, or citizen_id already exists",
            };
        }

        // Kiểm tra user đã tồn tại trong Wallet chưa
        const userExists = await wallet.get(username);
        if (userExists) {
            return {
                success: false,
                message: "User already exists in wallet",
            };
        }

        // Kiểm tra admin đã tồn tại trong Wallet chưa
        const adminIdentity = await wallet.get("admin");
        if (!adminIdentity) {
            return {
                success: false,
                message: "Admin identity not found",
            };
        }

        const provider = wallet
            .getProviderRegistry()
            .getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, "admin");

        // Kiểm tra user đã tồn tại trong Fabric CA chưa
        try {
            await ca.getIdentity(username, adminUser);
            return {
                success: false,
                message: "Identity already registered in CA.",
            };
        } catch (error) {
            console.log(
                "Identity not found in CA, proceeding with registration..."
            );
        }

        // Đăng ký user trong Fabric CA
        const enrollmentSecret = await ca.register(
            {
                enrollmentID: username,
                affiliation: "org1.department1",
                role: "client",
                attrs: [
                    { name: "co", value: common_name },
                    { name: "og", value: organization },
                    { name: "ou", value: organizational_unit },
                    { name: "ct", value: country },
                    { name: "st", value: state },
                    { name: "lc", value: locality },
                    { name: "role", value: role, ecert: true }, // Thêm quyền vào CA
                ],
            },
            adminUser
        );

        // Enroll user để lấy certificate và key
        const EnrollUser = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: enrollmentSecret,
        });

        const userIdentity = {
            credentials: {
                certificate: EnrollUser.certificate,
                privateKey: EnrollUser.key.toBytes(),
            },
            mspId: "Org1MSP",
            type: "X.509",
        };

        // Lưu user vào Wallet
        await wallet.put(username, userIdentity);

        // Lưu user vào database
        const insertSQL = `
    INSERT INTO users (
        username, email, citizen_id, common_name, organization, organizational_unit,
        country, state, locality, role, dob, certificate, public_key, private_key, enrollment_secret
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

// Gọi truy vấn:
await new Promise((resolve, reject) => {
    db.query(
        insertSQL,
        [
            username,
            email,
            citizen_id,
            common_name,
            organization,
            organizational_unit,
            country,
            state,
            locality,
            role,
            dob, // ngày sinh
            EnrollUser.certificate,
            EnrollUser.key.getPublicKey().toBytes(),
            EnrollUser.key.toBytes(),
            enrollmentSecret,
        ],
        (err, result) => {
            if (err) reject(err);
            else resolve(result);
        }
    );
});

        // Nội dung email
        let emailContent = `
    <p>Xin chào <strong>${username}</strong>,</p>
    <p>Bạn đã đăng ký thành công tài khoản trên hệ thống <strong>Hyperledger Credential</strong>.</p>
    <p><strong>Thông tin tài khoản của bạn:</strong></p>
    <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Vai trò:</strong> ${role}</li>
    </ul>
    <p><strong>Mật khẩu ban đầu của bạn:</strong> <code>${enrollmentSecret}</code></p>
    <p>Vui lòng đăng nhập ngay và đổi mật khẩu để bảo mật tài khoản.</p>
    <p>Trân trọng,</p>
    <p><strong>Hệ thống Hyperledger Credential</strong></p>
`;

        // Gửi email
        await sendEmail(
            email,
            "✅ Đăng ký tài khoản thành công!",
            emailContent
        );

        return {
            success: true,
            message: "User registered successfully",
            role: role,
            enrollmentSecret,
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            success: false,
            message: error.message,
        };
    }
}

module.exports = { Login, Register , LoginWithToken };
