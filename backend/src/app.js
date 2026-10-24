// Import Express to create the API server and routes.
import express from 'express';

// Import CORS to allow requests from the frontend origin.
import cors from 'cors';

// Import Helmet to add security-related HTTP headers.
import helmet from 'helmet';

// Import rateLimit to limit repeated requests from a client.
import rateLimit from 'express-rate-limit';

// Import Mongoose to check the MongoDB connection state.
import mongoose from 'mongoose';

// Import the employee router for employee API endpoints.
import employeeRoutes from './routes/employee.routes.js';

// Import middleware for unmatched routes and errors.
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

// Create the Express application.
const app = express();

// Add security-related HTTP headers to responses.
app.use(helmet());

// Allow requests from the configured frontend origin.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

// Limit each client to 100 requests in a 15-minute window.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
  })
);

// Parse incoming JSON before routes read req.body.
app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.status(isConnected ? 200 : 500).json({
        success : isConnected,
        database : isConnected ? 'Connected' : 'Disconnected'
    });
});

// 👉 2. MOUNT LINE
app.use('/api/v1/employees', employeeRoutes);

// Fallback & Error Handlers (Eppovume Kadasila dhaan irukkanum!)
app.use(notFound);
app.use(errorHandler);

export default app;