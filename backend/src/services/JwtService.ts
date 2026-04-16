import { Service } from "typedi";
import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";
import { UserProps } from "../types/auth";

@Service()
export class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;
  private emailSecret: Secret;
  private accessExpiresIn: number;
  private refreshExpiresIn: number;
  private emailExpiresIn: number;

  constructor() {
    this.accessSecret = process.env.JWT_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.emailSecret = process.env.JWT_VERIFY_EMAIL_SECRET!;
    this.accessExpiresIn = 15 * 60; // 15m
    this.refreshExpiresIn = 7 * 24 * 60 * 60; // 7d
    this.emailExpiresIn = 3 * 60; // 3m
  }

  signAccessToken(payload: UserProps): string {
    const options: SignOptions = { expiresIn: this.accessExpiresIn };
    return jwt.sign(payload, this.accessSecret, options);
  }

  signRefreshToken(payload: UserProps): string {
    const options: SignOptions = { expiresIn: this.refreshExpiresIn };
    return jwt.sign(payload, this.refreshSecret, options);
  }

  signVerifyEmailToken(payload: UserProps): string {
    const options: SignOptions = { expiresIn: this.emailExpiresIn };
    return jwt.sign(payload, this.emailSecret, options);
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessSecret) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }

  verifyEmailToken(token: string): JwtPayload {
    return jwt.verify(token, this.emailSecret) as JwtPayload;
  }

  decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
