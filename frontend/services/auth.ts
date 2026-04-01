import instance from "@/lib/api";
import { BaseService } from "./base";
import { LoginInput, RegisterInput } from "@/types/auth";

class AuthService extends BaseService {
  constructor() {
    super("/auth");
  }

  async register(data: RegisterInput) {
    return await instance.post(`/users/register`, data);
  }

  async login(data: LoginInput) {
    return await instance.post(`/users/login`, data);
  }
}

const authService = new AuthService();
export default authService;
