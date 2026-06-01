import mongoose from 'mongoose';
import { env } from './env';

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) return;
  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
    });
    connectionPromise.then(
      () => {
        // eslint-disable-next-line no-console
        console.log(`[db] connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      },
      () => {
        connectionPromise = null;
      },
    );
  }
  await connectionPromise;
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  connectionPromise = null;
};
