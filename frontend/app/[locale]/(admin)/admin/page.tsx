import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, UserCheck, TrendingUp } from "lucide-react";

export const dashboardStats = {
  totalUsers: 1284,
  activeUsers: 842,
  verifiedUsers: 963,
  totalRevenue: 45230,
};

export type FakeUser = {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  isActive: boolean;
  role: "user" | "admin";
};

export const getUsers = (): FakeUser[] => {
  return [
    {
      id: 1,
      fullName: "Nguyễn Văn An",
      email: "an.nguyen@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=an",
      isActive: true,
      role: "user",
    },
    {
      id: 2,
      fullName: "Trần Thị Bích",
      email: "bich.tran@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bich",
      isActive: true,
      role: "user",
    },
    {
      id: 3,
      fullName: "Lê Hoàng Minh",
      email: "minh.le@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=minh",
      isActive: false,
      role: "user",
    },
    {
      id: 4,
      fullName: "Phạm Thùy Dung",
      email: "dung.pham@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dung",
      isActive: true,
      role: "user",
    },
    {
      id: 5,
      fullName: "Hoàng Đức Anh",
      email: "anh.hoang@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anh",
      isActive: true,
      role: "admin",
    },
    {
      id: 6,
      fullName: "Võ Thanh Tùng",
      email: "tung.vo@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tung",
      isActive: false,
      role: "user",
    },
    {
      id: 7,
      fullName: "Đặng Ngọc Lan",
      email: "lan.dang@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lan",
      isActive: true,
      role: "user",
    },
    {
      id: 8,
      fullName: "Bùi Quốc Khánh",
      email: "khanh.bui@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=khanh",
      isActive: true,
      role: "user",
    },
  ];
};
export default function AdminDashboard() {
  const users = getUsers();
  const stats = dashboardStats;

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      description: "Currently active",
    },
    {
      title: "Verified Users",
      value: stats.verifiedUsers,
      icon: CheckCircle2,
      description: "Email verified",
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      description: "Total revenue",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the admin dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-border pb-4 last:border-b-0"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {user.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
