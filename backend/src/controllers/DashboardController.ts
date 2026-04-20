import {
  JsonController,
  Get,
  QueryParam,
  Authorized,
} from "routing-controllers";
import { Service } from "typedi";
import { DashboardService } from "../services/DashboardService";
import { UserRole } from "../entities/User";

@Service()
@JsonController("/dashboard")
@Authorized(UserRole.ADMIN)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("/")
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get("/users")
  async getRecentUsers(@QueryParam("limit") limit: number = 5) {
    return this.dashboardService.getRecentUsers(limit);
  }

  @Get("/posts")
  async getRecentPosts(@QueryParam("limit") limit: number = 5) {
    return this.dashboardService.getRecentPosts(limit);
  }

  @Get("/growth/users")
  async getUserGrowth() {
    return this.dashboardService.getUserGrowth();
  }

  @Get("/growth/posts")
  async getPostGrowth() {
    return this.dashboardService.getPostGrowth();
  }
}
