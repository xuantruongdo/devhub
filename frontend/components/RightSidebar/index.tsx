"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const trendingTopics = [
  { tag: "#ReactJS", posts: "125K posts" },
  { tag: "#WebDevelopment", posts: "98K posts" },
  { tag: "#JavaScript", posts: "234K posts" },
];

const suggestedUsers = [
  {
    name: "Emily Rodriguez",
    avatar: "",
    handle: "@emilyrodriguez",
    isVerified: false,
  },
  {
    name: "James Thompson",
    avatar: "",
    handle: "@jamesthompson",
    isVerified: true,
  },
  {
    name: "Lisa Anderson",
    avatar: "",
    handle: "@lisaanderson",
    isVerified: false,
  },
  {
    name: "Chris Davidson",
    avatar: "",
    handle: "@chrisdavidson",
    isVerified: true,
  },
];

export default function RightSidebar() {
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  const handleFollow = (handle: string) => {
    const newFollowed = new Set(followedUsers);
    if (newFollowed.has(handle)) {
      newFollowed.delete(handle);
    } else {
      newFollowed.add(handle);
    }
    setFollowedUsers(newFollowed);
  };

  return (
    <aside className="hidden xl:flex w-80 bg-card flex-col sticky h-[calc(100vh-4rem)] overflow-y-auto border-l border-border">
      <div className="p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-6 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
        </div>
      </div>

      <Card className="mx-3 rounded-2xl">
        <CardHeader className="pb-0">
          <h2 className="text-xl font-bold text-foreground">{`What's Trending`}</h2>
        </CardHeader>
        <CardContent className="p-0">
          {trendingTopics.map((topic, index) => (
            <button
              key={index}
              className={`w-full px-4 py-4 hover:bg-secondary transition text-left ${
                index !== trendingTopics.length - 1
                  ? "border-b border-border"
                  : ""
              }`}
            >
              <p className="font-bold text-foreground">{topic.tag}</p>
              <p className="text-sm text-muted-foreground">{topic.posts}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="mx-3 rounded-2xl bg-muted mt-4">
        <CardHeader className="pb-0">
          <h2 className="text-xl font-bold text-foreground">
            Suggested for you
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <div>
            {suggestedUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 border-b border-border hover:bg-secondary transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar size="lg">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.handle}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleFollow(user.handle)}
                  className={`px-4 py-1.5 rounded-full font-bold transition flex-shrink-0 ml-2 text-sm ${
                    followedUsers.has(user.handle)
                      ? "bg-muted text-foreground border border-border hover:bg-destructive/10"
                      : "bg-primary text-primary-foreground hover:shadow-lg"
                  }`}
                >
                  {followedUsers.has(user.handle) ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto p-4 text-xs text-muted-foreground">
        <p>© 2024 DevHub. All rights reserved.</p>
      </div>
    </aside>
  );
}
