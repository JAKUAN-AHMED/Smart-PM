import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

export const validate =
  (schema: Schema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    req[source] = parsed as unknown as typeof req[typeof source];
    next();
  };
