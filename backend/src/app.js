import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

// Register API routes
app.use('/api', apiRouter);

// Centralized error handling middleware (must be registered last)
app.use(errorMiddleware);

export default app;
