const db = require('../config/connectToDB');
const {sendEmail} = require('../utils/mailSender');
const crypto = require('crypto');

exports.getUsers = async () => {
  try {
    const users = await db.query(
      'SELECT id, username, email, common_name, role, created_at,dob FROM users',
    );
    return {success: true, users}; // Trả về danh sách đầy đủ
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw new Error('Lỗi server');
  }
};

exports.getUserDetail = async id => {
  try {
    const [users] = await db.query(
      'SELECT id, username, email, citizen_id, role, common_name, organization, organizational_unit, country, state, locality, created_at FROM users WHERE id = ?',
      [id],
    );

    return {success: true, users};
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    throw new Error('Lỗi server');
  }
};
exports.generateNewPassword = async (common_name, username, citizen_id) => {
  try {
    // Tạo mật khẩu ngẫu nhiên (10 ký tự hex)
    const newPassword = crypto.randomBytes(5).toString('hex');
    console.log('Mật khẩu mới:', newPassword);

    // Cập nhật mật khẩu mới trong database
    const updateResult = await db.query(
      'UPDATE users SET enrollment_secret = ? WHERE common_name = ? AND username = ? AND citizen_id = ?',
      [newPassword, common_name, username, citizen_id],
    );

    // Kiểm tra xem có cập nhật được không
    if (!updateResult || updateResult.affectedRows === 0) {
      throw new Error(
        'Không tìm thấy người dùng hoặc không cập nhật được mật khẩu.',
      );
    }

    // Truy vấn lấy email của người dùng
    const [rows] = await db.query(
      'SELECT email FROM users WHERE common_name = ? AND username = ? AND citizen_id = ?',
      [common_name, username, citizen_id],
    );

    console.log(rows);
    // Kiểm tra xem có email hay không
    if (!rows || rows.length === 0) {
      throw new Error('Không tìm thấy email người dùng.');
    }

    const email = rows.email; // Lấy email từ kết quả truy vấn
    console.log('Gửi email đến:', email);

    // Nội dung email
    let content = `
            <p>Xin chào <strong>${username}</strong>,</p>
            <p>Bạn đã yêu cầu cấp lại mật khẩu.</p>
            <p><strong>Mật khẩu mới của bạn là:</strong> <code>${newPassword}</code></p>
            <p>Vui lòng đăng nhập và đổi lại mật khẩu ngay lập tức để đảm bảo an toàn.</p>
            <p>Trân trọng,</p>
            <p>Hệ thống Hyperledger Credential</p>
        `;

    // Gửi email
    await sendEmail(email, '🔑 Mật khẩu mới của bạn', content);

    return {
      success: true,
      message: 'Mật khẩu mới đã được gửi qua email.',
    };
  } catch (error) {
    console.error('Lỗi khi tạo mật khẩu mới:', error);
    throw new Error('Lỗi server');
  }
};

exports.changePassword = async (
  username,
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  try {
    // Kiểm tra mật khẩu mới và mật khẩu xác nhận có trùng khớp không
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp!',
      };
    }

    // Lấy user từ database
    const [rows] = await db
      .promise()
      .query('SELECT enrollment_secret FROM users WHERE username = ?', [
        username,
      ]);

    if (rows.length === 0) {
      return {success: false, message: 'User không tồn tại!'};
    }

    const user = rows[0];

    // So sánh mật khẩu cũ
    if (oldPassword !== user.enrollment_secret) {
      return {success: false, message: 'Mật khẩu cũ không đúng!'};
    }

    // Cập nhật mật khẩu mới vào database
    await db
      .promise()
      .query('UPDATE users SET enrollment_secret = ? WHERE username = ?', [
        newPassword,
        username,
      ]);

    return {success: true, message: 'Đổi mật khẩu thành công!'};
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    return {success: false, message: 'Lỗi server!'};
  }
};

exports.getDegrees = async id => {
  try {
    const degrees = await db.query(
      'SELECT degrees.id, degrees.degree_name,degrees.degree_type, majors.name AS major_name, degrees.status, degrees.issued_at, degrees.graduation_year, degrees.gpa, users.common_name FROM degrees JOIN users ON degrees.user_id = users.id JOIN majors ON degrees.major_id = majors.id WHERE users.id = ?;',
      [id],
    );
    return {success: true, degrees}; // Trả về danh sách đầy đủ
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    throw new Error('Lỗi server');
  }
};

// Tạo chỉnh sửa PIN
exports.createPin = async (req, res) => {
  try {
    const {pin, username} = req.body;

    // Kiểm tra đầu vào hợp lệ
    if (!validateInput(pin) || !validateInput(username)) {
      return res.status(400).json({
        data: {
          success: false,
          message: 'Invalid input. Username and PIN are required.',
        },
      });
    }

    const sql = 'UPDATE users SET pin_code = ? WHERE username = ?';
    const [result] = await db.promise().query(sql, [pin, username]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        data: {
          success: false,
          message: 'User not found or PIN not updated.',
        },
      });
    }

    return res.status(200).json({
      data: {
        success: true,
        message: 'PIN updated successfully.',
      },
    });
  } catch (error) {
    console.error('Error updating PIN:', error);
    return res.status(500).json({
      data: {
        success: false,
        message: 'An error occurred while updating PIN.',
      },
    });
  }
};

// Lấy PIN
exports.getPin = async (req, res) => {
  try {
    const {username} = req.query;
    console.log('Request Body:', username); // Kiểm tra dữ liệu gửi lên
    //Kiểm tra đầu vào hợp lệ
    if (!validateInput(username)) {
      return res.status(400).json({
        data: {
          success: false,
          message: 'Invalid input. Username is required.',
        },
      });
    }

    const sql = 'SELECT pin_code FROM users WHERE username = ?';
    const [rows] = await db.promise().query(sql, [username]);

    if (rows.length === 0) {
      return res.status(404).json({
        data: {
          success: false,
          message: 'User not found.',
        },
      });
    }

    return res.status(200).json({
      data: {
        success: true,
        message: 'PIN retrieved successfully.',
        pin: rows[0].pin_code,
      },
    });
  } catch (error) {
    console.error('Error retrieving PIN:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving PIN.',
    });
  }
};
