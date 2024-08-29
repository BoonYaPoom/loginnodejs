const mysql = require('mysql2/promise');
require("dotenv").config();

let conn = null;

const initMySQL = async () => {
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
        });
        console.log('MySQL connection established successfully.');
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
    }
};

const getConnection = () => {
    if (!conn) {
        throw new Error('MySQL connection not established');
    }
    return conn;
};

module.exports = { initMySQL, getConnection };
