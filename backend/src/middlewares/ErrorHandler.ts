import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { Service } from "typedi";

interface ValidationErrorShape {
  target?: object;
  value?: any;
  property: string;
  children: ValidationErrorShape[];
  constraints?: Record<string, string>;
}

@Service()
@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Response {
    const status =
      (error as { httpCode?: number; status?: number })?.httpCode ||
      (error as { httpCode?: number; status?: number })?.status ||
      500;

    let message =
      (error as { message?: string })?.message || "Internal Server Error";

    const errors =
      (error as { errors?: ValidationErrorShape[] })?.errors || null;

    if (errors && Array.isArray(errors)) {
      const validationMessages: string[] = errors
        .map((err: ValidationErrorShape) => {
          if (err.constraints) {
            return Object.values(err.constraints).join(". ");
          }
          return null;
        })
        .filter(Boolean) as string[];

      if (validationMessages.length > 0) {
        message = validationMessages.join(". ");
      }
    }

    return res.status(status).json({
      success: false,
      message,
      errors,
    });
  }
}
