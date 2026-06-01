import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, ok } from '../utils/apiResponse';
import { getMe, loginUser, signupUser } from '../services/auth.service';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await signupUser(req.body);
  return created(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  return ok(res, result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getMe(req.user!.id);
  return ok(res, user);
});
