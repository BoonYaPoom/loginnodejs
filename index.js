const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const session = require('express-session')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { getConnection, initMySQL } = require('./DB/db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "100mb" }));
const corsOptions = {
    origin: '*',  // หรือโดเมนที่คุณต้องการอนุญาต
    credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser())
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}))

const secret = 'mysecret'

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Your API Title',
            version: '1.0.0',
            description: 'API documentation',
        },
        servers: [
            {
                url: 'http://localhost:3002',
            },
        ],
    },
    apis: ['./routes/api/*.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import your API routes
app.use('/users', require('./routes/api/UserApi'));
app.use('/auth', require('./routes/api/Auth'));

// Default route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Route to check database connection
app.get('/test-db', async (req, res) => {
    try {
        const conn = getConnection()
        // console.log(conn); // Log the connection object to console
        const [rows] = await conn.execute('SELECT 1 + 1 AS result');
        res.send(`Database connection is working. Test query result: ${rows[0].result}`);
    } catch (error) {
        res.status(500).send(`Error querying the database: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
    await initMySQL()
    console.log(`server prot ${PORT}`)
});
