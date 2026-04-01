interface AuthBase {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthBase {
  fullName: string;
}

export type LoginInput = AuthBase;
