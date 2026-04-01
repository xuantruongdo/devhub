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

  async current() {
    return await instance.get(`/users/current`);
  }

  async logout() {
    return await instance.post(`/users/logout`);
  }
}

const authService = new AuthService();
export default authService;
