import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import propertyRoutes from './routes/propertyRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/sanitizeInput';
import aiHubRoutes from './routes/aiHubRoutes';

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-firecrawl-key'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeInput);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests; try again later', data: null },
});

app.use('/api', generalLimiter);
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication requests; try again later', data: null },
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is healthy', data: { service: 'realestate-api' } });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/appointments', appointmentRoutes);
if (process.env.AI_HUB_ENABLED === 'true') {
  app.use('/api/ai-hub', aiHubRoutes);
}

app.use(notFound);
app.use(errorHandler);

async function start(): Promise<void> {
  await connectDatabase();
  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

if (!process.env.VERCEL) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
} else {
  connectDatabase().catch((error) => {
    console.error('Failed to connect database:', error);
  });
}

export default app;
