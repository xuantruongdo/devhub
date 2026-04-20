"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  UserCheck,
  FileText,
  TrendingUp,
  ExternalLink,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dashboardService from "@/services/dashboard";
import { User } from "@/types/user";
import { Post } from "@/types/post";
import { toastError } from "@/lib/toast";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/useTranslation";
import Image from "next/image";
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import { DashboardStats } from "@/types";
import moment from "moment";
import { StatusBadge } from "@/components/Admin/StatusBadge";
import UserPostChart from "@/components/Dashboard/UserPostChart";
import UserGrowthChart from "@/components/Dashboard/UserGrowthChart";

export default function AdminDashboard() {
  const { t, locale, ready } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [postGrowth, setPostGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [statsRes, usersRes, postsRes, userGrowthRes, postGrowthRes] =
          await Promise.all([
            dashboardService.getStats(),
            dashboardService.getRecentUsers(5),
            dashboardService.getRecentPosts(5),
            dashboardService.getUserGrowth(),
            dashboardService.getPostGrowth(),
          ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setPosts(postsRes.data);
        setUserGrowth(userGrowthRes.data);
        setPostGrowth(postGrowthRes.data);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (!stats || !ready) return null;

  const statCards = [
    {
      title: t("admin.dashboard.stats.totalUsers"),
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: t("admin.dashboard.stats.activeUsers"),
      value: stats.activeUsers,
      icon: UserCheck,
    },
    {
      title: t("admin.dashboard.stats.verifiedUsers"),
      value: stats.verifiedUsers,
      icon: CheckCircle2,
    },
    {
      title: t("admin.dashboard.stats.totalPosts"),
      value: stats.totalPosts,
      icon: FileText,
    },
    {
      title: t("admin.dashboard.stats.newUsersToday"),
      value: stats.newUsersToday,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">{t("admin.dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("admin.dashboard.description")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t("admin.dashboard.chart.userPostGrowth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <UserPostChart
              data={userGrowth.map((u, i) => ({
                date: u.date,
                users: u.users,
                posts: postGrowth[i]?.posts || 0,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t("admin.dashboard.chart.userGrowth")}</CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowth} />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.users.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b pb-3 last:border-none"
              >
                <Link
                  href={`/${locale}/${user.username}`}
                  className="flex items-center gap-3"
                  target="_blank"
                >
                  <Avatar size="lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} />
                    ) : (
                      <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>

                  <span className="font-medium">{user.fullName}</span>

                  {user.isVerified && (
                    <Image
                      src="/verification-badge.svg"
                      alt="verified"
                      width={16}
                      height={16}
                    />
                  )}

                  <ExternalLink className="w-4 h-4" />
                </Link>

                <StatusBadge value={user.isActive} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.dashboard.posts.title")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b pb-3 last:border-none">
                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/${locale}/${post.author.username}`}>
                    <Avatar size="lg">
                      {post.author.avatar ? (
                        <AvatarImage src={post.author.avatar} />
                      ) : (
                        <AvatarFallback>
                          {post.author.fullName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Link>

                  <div>
                    <Link
                      href={`/${locale}/${post.author.username}`}
                      className="text-sm font-medium"
                    >
                      {post.author.fullName}
                    </Link>

                    <p className="text-xs text-muted-foreground">
                      {moment(post.createdAt).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${locale}/posts/${post.id}`}
                  className="block space-y-2"
                >
                  <p className="text-sm text-muted-foreground line-clamp-2 hover:text-foreground transition">
                    {post.content || t("admin.dashboard.posts.noContent")}
                  </p>

                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {post.likeCount}
                    </span>

                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.commentCount}
                    </span>

                    <span className="flex items-center gap-1">
                      <Repeat2 className="w-3.5 h-3.5" />
                      {post.shareCount}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
