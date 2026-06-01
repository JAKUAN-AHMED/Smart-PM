import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { IUser, Role, User } from '../models/User';
import { ApiError } from '../utils/ApiError';

interface SignupInput {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

const colorPalette = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const randomColor = (): string => colorPalette[Math.floor(Math.random() * colorPalette.length)];

const sign = (user: IUser): string =>
  jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as SignOptions,
  );

const sanitize = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarColor: user.avatarColor,
});

export const signupUser = async (input: SignupInput) => {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }
  const user = await User.create({ ...input, avatarColor: randomColor() });
  return { user: sanitize(user), token: sign(user) };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  const ok = await user.comparePassword(input.password);
  if (!ok) throw ApiError.unauthorized('Invalid email or password');
  return { user: sanitize(user), token: sign(user) };
};

export const getMe = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return sanitize(user);
};
