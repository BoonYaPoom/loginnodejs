require("dotenv").config();

let conn = null;

    const mysql = require("mysql2");

    conn = mysql
      .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
      })
      .promise();
      
module.exports = conn;
