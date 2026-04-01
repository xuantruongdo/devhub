"use client";

import { Home, Compass, Mail, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function LeftSidebar() {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Compass, label: "Explore", active: false },
    { icon: Mail, label: "Messages", active: false },
    { icon: Bookmark, label: "Saved", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-72 border-r border-border bg-card flex-col sticky top-16 h-[calc(100vh-4rem)]">
      {/* Navigation Menu */}
      <nav className="flex flex-col gap-2 p-6">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-4 px-6 py-3 rounded-full transition font-semibold text-lg ${
              item.active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span>{item.label}</span>
          </button>
        ))}

        <Button className="w-full mt-6 py-6 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:shadow-lg transition">
          Post
        </Button>
      </nav>

      <div className="mt-auto p-6 border-t border-border">
        <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition">
          <div className="flex items-center gap-3 flex-1">
            <Avatar size="lg">
              {false ? (
                <AvatarImage src={""} alt={"User"} />
              ) : (
                <AvatarFallback>S</AvatarFallback>
              )}
            </Avatar>
            <div className="text-left min-w-0">
              <p className="font-bold text-foreground truncate">
                Sarah Johnson
              </p>
              <p className="text-sm text-muted-foreground truncate">
                @sarahjohnson
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
        </button>
      </div>
    </aside>
  );
}
