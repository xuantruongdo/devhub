import {
  Action,
  ExpressMiddlewareInterface,
  Middleware,
  UnauthorizedError,
  getMetadataArgsStorage,
} from "routing-controllers";
import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { match } from "path-to-regexp";
import { UserRole } from "../entities/User";
import { IS_PUBLIC_KEY } from "../decorators/public.route.decorator";

@Service()
@Middleware({ type: "before" })
export class AuthMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): void {
    try {
      const metadata = getMetadataArgsStorage();
      const route = req.path;
      const method = req.method.toLowerCase();

      let isPublic = false;

      // Kiểm tra route có phải public không
      for (const controller of metadata.controllers) {
        const baseRoute = controller.route || "";

        for (const action of metadata.actions.filter(
          (a) => a.target === controller.target,
        )) {
          const fullRoute = `${baseRoute}${action.route}`;
          const normalizedReqPath = route.replace(/\/+$/, "");
          const normalizedFullRoute = fullRoute.replace(/\/+$/, "");

          const matcher = match(normalizedFullRoute, {
            decode: decodeURIComponent,
          });

          if (
            matcher(normalizedReqPath) &&
            method === action.type.toLowerCase()
          ) {
            isPublic =
              Reflect.getMetadata(
                IS_PUBLIC_KEY,
                action.target.prototype,
                action.method,
              ) ||
              Reflect.getMetadata(IS_PUBLIC_KEY, action.target) ||
              Reflect.getMetadata(IS_PUBLIC_KEY, controller.target) ||
              false;

            break;
          }
        }

        if (isPublic) break;
      }

      if (isPublic) return next();

      let token: string | undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token) {
        throw new UnauthorizedError("Missing token");
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // @ts-ignore
      req.user = {
        id: decoded.id,
        username: decoded.username,
        fullName: decoded.fullName,
        email: decoded.email,
        role: decoded.role,
        avatar: decoded.avatar,
        isVerified: decoded.isVerified,
      };

      next();
    } catch (error) {
      console.log("AuthMiddleware error:", error);
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}

// Authorization checker
export async function authorizationChecker(
  action: Action,
  roles: UserRole[],
): Promise<boolean> {
  const user = action.request.user;

  if (!user || !user.role) return false;

  return roles.includes(user.role);
}
