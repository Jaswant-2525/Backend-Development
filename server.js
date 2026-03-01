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

// --- NEW: Render Proxy Setting ---
// Tells Express to trust Render's load balancer so it doesn't block legitimate traffic
app.set('trust proxy', 1);

// --- Core Middleware ---
app.use(express.json());
app.use(cors());

// --- UPDATED: Enterprise Security Middleware ---
// Relaxed the Cross-Origin policy so your frontend domain is allowed to connect
app.use(helmet({ crossOriginResourcePolicy: false }));            
app.use(mongoSanitize());     // Strips $ and . from req.body/query/params to prevent NoSQL injection

app.use('/api/auth', authRoutes);
app.use('/api/evaluation', evalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));