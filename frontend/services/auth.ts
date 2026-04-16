import instance from "@/lib/api";
import { LoginInput, LoginWithGoogle, RegisterInput } from "@/types/auth";

class AuthService {
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

  async loginGoogle(data: LoginWithGoogle) {
    return await instance.post("/users/google", data);
  }
}

const authService = new AuthService();
export default authService;
