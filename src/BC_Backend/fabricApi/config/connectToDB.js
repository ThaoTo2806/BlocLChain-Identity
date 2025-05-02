const util = require("util");
require("dotenv").config();
const mysql = require("mysql2");

// Log toàn bộ biến môi trường liên quan đến DB
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "***HIDDEN***" : "NOT FOUND"); // Ẩn password để bảo mật
console.log("DB_NAME:", process.env.DB_NAME);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL Server");
});

db.query = util.promisify(db.query);

module.exports = db;
