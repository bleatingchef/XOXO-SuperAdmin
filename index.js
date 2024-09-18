const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
<<<<<<< HEAD

// Import routes with CommonJS syntax
const amountTableRoute = require('./routes/amountTableRoute');
const templateRoute = require('./routes/templateRoute');
const { adminAuthRoutes } = require('./routes');

=======
const { adminAuthRoutes, employeRoutes } = require('./routes');
>>>>>>> 69738c2b6523bfc4ffc181566d839b537ce451e0
// Initialize Express app
const app = express();
// Middleware setup
<<<<<<< HEAD
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet()); // Security headers
app.use(rateLimit({ 
    windowMs: 15 * 60 * 1000, 
    max: 100 
}));
app.use(bodyParser.json({ limit: '10mb' }));  
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// MongoDB connection
const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString);

const database = mongoose.connection;
database.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
database.once('connected', () => {
    console.log('Database Connected');
});

// Routes for serving images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/superAdmin-route', adminAuthRoutes);
app.use('/admin-route', adminAuthRoutes);
app.use('/amountTable', amountTableRoute);
app.use('/template', templateRoute);

// Start the server
const PORT = process.env.PORT || 5005;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started at http://localhost:${PORT}`);
=======
app.use(express.json()); // Parse incoming JSON requests
// CORS configuration for handling cross-origin requests
const allowedOrigins = [
    'https://xoxo.markletechandmedia.com',
    'https://xoxoemployee.markletechandmedia.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5004'
];
app.use(cors({
    origin: allowedOrigins, // List of allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Supported HTTP methods
    credentials: true // Allow cookies and credentials to be shared across origins
}));
// Parse cookies
app.use(cookieParser());
// Security headers using Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "https://xoxoapi.markletechandmedia.com", "http://localhost:5004", "http://localhost:5173", "http://localhost:5174"] // Trusted sources for images
        }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin resource loading
}));
// Rate limiting to prevent abuse (100 requests per 15 minutes per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Maximum requests per IP
    message: 'Too many requests from this IP, please try again later.',
    headers: true
});
app.use(limiter); // Apply rate limiter to all requests
// Body parser configuration for larger payloads
app.use(bodyParser.json({ limit: '10mb' })); // Increase request size limit for JSON
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Handle URL-encoded data
// MongoDB connection
const mongoString = process.env.DATABASE_URL;
mongoose.connect(mongoString,)
    .then(() => console.log('Database Connected'))
    .catch(err => console.error('MongoDB connection error:', err));
// Serve static files (e.g., images) from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));
// Define routes for different parts of the app
app.use('/superAdmin-route', adminAuthRoutes);
app.use('/admin-route', adminAuthRoutes);
app.use('/employe-route', employeRoutes);
// Error handling middleware for catching and logging errors
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({ error: 'Something went wrong!' }); // Send 500 status code for internal errors
>>>>>>> 69738c2b6523bfc4ffc181566d839b537ce451e0
});
// Start the server
const PORT = process.env.PORT || 5004;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${PORT}`);
});








