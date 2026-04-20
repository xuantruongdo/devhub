import instance from "@/lib/api";

class DashboardService {
  async getStats() {
    return await instance.get(`/dashboard`);
  }

  async getRecentUsers(limit = 5) {
    return await instance.get(`/dashboard/users`, {
      params: { limit },
    });
  }

  async getRecentPosts(limit = 5) {
    return await instance.get(`/dashboard/posts`, {
      params: { limit },
    });
  }

  async getUserGrowth() {
    return await instance.get(`/dashboard/growth/users`);
  }

  async getPostGrowth() {
    return await instance.get(`/dashboard/growth/posts`);
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
