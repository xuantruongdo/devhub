import { UserRole } from "../entities/User";

export interface UserProps {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar: string;
  isVerified: boolean;
}
