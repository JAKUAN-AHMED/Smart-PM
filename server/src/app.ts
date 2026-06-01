import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { asyncHandler } from './utils/asyncHandler';

const app = express();

app.use(helmet());
const origins = env.clientOrigin.split(',').map((s) => s.trim());
app.use(
  cors({
    origin: origins.includes('*') ? true : origins,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Ensure MongoDB is connected before any route runs (serverless-friendly).
app.use(
  asyncHandler(async (_req, _res, next) => {
    await connectDB();
    next();
  }),
);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
