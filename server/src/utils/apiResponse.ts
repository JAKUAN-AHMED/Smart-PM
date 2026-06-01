import { Response } from 'express';

export interface Meta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export const ok = <T>(res: Response, data: T, meta?: Meta, status = 200): Response =>
  res.status(status).json({ success: true, data, meta });

export const created = <T>(res: Response, data: T): Response => ok(res, data, undefined, 201);
