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

export interface LoginWithGoogle {
  email: string;
  fullName: string;
  avatar: string;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
