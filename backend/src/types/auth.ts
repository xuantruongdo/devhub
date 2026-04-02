import { UserRole } from "../entities/User";

export interface UserProps {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
}

export type FindUserOptions = {
  includeRefreshToken?: boolean;
};
