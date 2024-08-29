const express = require('express')
const router = express.Router()
const { getConnection } = require('../../DB/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const secret = 'mysecret'

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully registered
 *       400:
 *         description: Username or password is missing, or username already exists
 *       500:
 *         description: Error registering user
 */
router.post('/register', async (req, res) => {
    const conn = getConnection()
    const { username, password } = req.body

    try {
        if (!username || !password) {
            return res.status(400).send({ msg: 'Username or password is missing.' });
        }
        const [rows] = await conn.query('SELECT * FROM users WHERE username = ?', username);
        if (rows.length) {
            return res.status(400).send({ msg: 'Username ซ้ำ' });
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const userData = {
            username: username,
            status: 1,
            date: new Date(),
            password: passwordHash
        }
        const [results] = await conn.query('INSERT INTO users SET ?', userData)
        res.json({
            status: {
                code: "0001",
                message: "success",
                service: "hi"
            },
            playload: {
                message: 'Insert OK',
                results
            }
        })
    } catch (error) {
        res.status(500).send({
            msg: 'Error registering user',
            error: error
        });
    }
})

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User successfully logged in
 *       400:
 *         description: Password does not match
 *       500:
 *         description: Error logging in user
 */
router.post('/login', async (req, res) => {
    const conn = getConnection()
    const { username, password } = req.body
    try {
        const [results] = await conn.query('SELECT * FROM users WHERE username = ?', username);
        const userData = results[0]
        const match = await bcrypt.compare(password, userData.password)
        if (!match) {
            res.status(400).send({ msg: 'Password ไม่ตรง' });
            return false
        }
        const token = jwt.sign({ username, role: 'admin' }, secret, { expiresIn: '1h' })
        res.cookie('token', token, {
            maxAge: 300000,
            secure: true,
            httpOnly: true,
            sameSite: "none"
        })
        res.json({
            status: {
                code: "0001",
                message: "success",
                service: "hi"
            },
            payload: {
                message: 'Insert OK',
                results: {
                    username: userData.username,
                    access_token: token
                },
            }
        })
    } catch (error) {
        res.status(500).send({
            msg: 'Error logging in user',
            error: error
        });
    }
})

/**
 * @swagger
 * /userslocal:
 *   get:
 *     summary: Retrieve all users with local auth token
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       500:
 *         description: Authentication failed
 */
router.get('/userslocal', async (req, res) => {
    const conn = getConnection()
    try {
        const authHeader = req.headers['authorization']
        let authToken = ''
        if (authHeader) {
            authToken = authHeader.split(' ')[1]
        }

        const user = jwt.verify(authToken, secret)
        const [checkResults] = await conn.query('SELECT * FROM users WHERE username = ?', user.username)
        if (!checkResults[0]) {
            res.status(400).send({
                msg: 'User not found'
            }); 
        }
        const [results] = await conn.query('SELECT * FROM users')
        res.json({
            status: {
                code: "0001",
                message: "success",
                service: "hi"
            },
            payload: {
                message: 'Insert OK',
                results: {
                    data: results,
                },
            }
        })
    } catch (error) {
        res.status(500).send({
            msg: 'Authentication failed',
            error: error
        });
    }
})

/**
 * @swagger
 * /userscook:
 *   get:
 *     summary: Retrieve all users with cookie auth token
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       500:
 *         description: Authentication failed
 */
router.get('/userscookies', async (req, res) => {
    const conn = getConnection()
    try {
        const authToken = req.cookies.token
        const user = jwt.verify(authToken, secret)
        const [checkResults] = await conn.query('SELECT * FROM users WHERE username = ?', user.username)
        if (!checkResults[0]) {
            res.status(400).send({
                msg: 'User not found'
            }); 
        }
        const [results] = await conn.query('SELECT * FROM users')
        res.json({
            message: 'Authentication OK',
            results
        })
    } catch (error) {
        res.status(500).send({
            msg: 'Authentication failed',
            error: error
        });
    }
})

/**
 * @swagger
 * /userssecsion:
 *   get:
 *     summary: Retrieve all users with session auth token
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       500:
 *         description: Authentication failed
 */
router.get('/userssecsion', async (req, res) => {
    const conn = getConnection()
    try {
        const authHeader = req.headers['authorization']
        let authToken = ''
        if (authHeader) {
            authToken = authHeader.split(' ')[1]
        }

        const user = jwt.verify(authToken, secret)
        const [checkResults] = await conn.query('SELECT * FROM users WHERE username = ?', user.username)
        if (!checkResults[0]) {
            res.status(500).send({
                msg: 'User not found'
            }); 
        }
        const [results] = await conn.query('SELECT * FROM users')
        res.json({
            message: 'Authentication OK',
            results
        })
    } catch (error) {
        res.status(500).send({
            msg: 'Authentication failed',
            error: error
        });
    }
})

module.exports = router
