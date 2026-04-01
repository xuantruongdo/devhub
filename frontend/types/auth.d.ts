interface AuthBase {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthBase {
  fullName: string;
}

export type LoginInput = AuthBase;

export interface CurrentUserResponse {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  avatar: string;
  isVerified: boolean;
}
