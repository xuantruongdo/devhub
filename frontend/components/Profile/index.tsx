"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Edit2, Link2, MapPin } from "lucide-react";
import { User } from "@/types/user";
import moment from "moment";
import RightSidebarProfile from "./RightSidebarProfile";

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  console.log("user", user);
  return (
    <div className="h-full min-h-screen flex overflow-hidden">
      <div className="flex-1 min-h-0 border-r border-border bg-card overflow-y-auto">
        {/* Cover Image */}
        <div className="w-full h-48 relative">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop"
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <button className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70">
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="px-6 pb-6">
          <div className="relative -mt-20 mb-6 flex items-end justify-between">
            <Avatar className="w-32 h-32 border-4 border-card">
              <AvatarImage
                src={user.avatar || "/placeholder.svg"}
                alt={user.fullName}
              />
              <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <Button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`${
                isFollowing
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {user.fullName}
            </h1>
            <p className="text-lg text-muted-foreground">@{user.username}</p>

            {user.bio && (
              <p className="mt-3 text-base text-foreground">{user.bio}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {user.location}
                </div>
              )}

              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  className="flex items-center gap-2 hover:text-primary"
                >
                  <Link2 className="w-4 h-4" /> {user.website}
                </a>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {moment(user.createdAt).format("DD/MM/YYYY")}
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              <button className="hover:opacity-70 transition">
                <span className="font-bold text-foreground">
                  {user.followingCount}
                </span>
                <span className="text-muted-foreground ml-2">Following</span>
              </button>
              <button className="hover:opacity-70 transition">
                <span className="font-bold text-foreground">
                  {user.followerCount}
                </span>
                <span className="text-muted-foreground ml-2">Followers</span>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-border my-6" />
        </div>
      </div>

      <RightSidebarProfile />
    </div>
  );
}
