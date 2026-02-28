import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';                         // 1. Secure HTTP Headers
import mongoSanitize from 'express-mongo-sanitize';   // 2. NoSQL Injection Protection
import connectDB from './config/db.js'; 

import authRoutes from './routes/authRoutes.js';
import evalRoutes from './routes/evalRoutes.js';

dotenv.config();
connectDB();

const app = express();

// --- Core Middleware ---
app.use(express.json());
app.use(cors());

// --- Enterprise Security Middleware ---
app.use(helmet());            // Sets secure HTTP headers (X-Content-Type, HSTS, etc.)
app.use(mongoSanitize());     // Strips $ and . from req.body/query/params to prevent NoSQL injection

app.use('/api/auth', authRoutes);
app.use('/api/evaluation', evalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));