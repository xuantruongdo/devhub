import { Service } from "typedi";
import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

@Service()
export class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;
  private accessExpiresIn: number;
  private refreshExpiresIn: number;

  constructor() {
    this.accessSecret = process.env.JWT_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessExpiresIn = 15 * 60; // 15m
    this.refreshExpiresIn = 7 * 24 * 60 * 60; // 7d
  }

  signAccessToken(payload: object): string {
    const options: SignOptions = { expiresIn: this.accessExpiresIn };
    return jwt.sign(payload, this.accessSecret, options);
  }

  signRefreshToken(payload: object): string {
    const options: SignOptions = { expiresIn: this.refreshExpiresIn };
    return jwt.sign(payload, this.refreshSecret, options);
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessSecret) as JwtPayload;
  }

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshSecret) as JwtPayload;
  }

  decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
