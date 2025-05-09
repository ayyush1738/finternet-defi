import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import healthcheckRouter from './app/routes/healthcheck.routes.js';
import authRouter from './app/routes/auth.routes.js';
import enterpriseRouter from './app/routes/enterprise.routes.js';

const app = express();

// Middleware
app.use(express.json());  // ✅ for JSON body
app.use(express.urlencoded({ extended: true }));  // optional: for form-data
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',  // ⚠️ Update to your frontend URL if needed
    credentials: true,
}));

// Routes
app.use('/api/v1/healthcheck', healthcheckRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/enterprise', enterpriseRouter);


app.listen(8000, () => {
    console.log('Server is running on port: 8000');
});
