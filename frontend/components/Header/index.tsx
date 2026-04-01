import { Bell, MessageCircle, Search, Settings } from "lucide-react";
import { ModeToggle } from "../ModeToggle";
import { LanguageToggle } from "../LanguageToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-lg">D</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground hidden sm:block">
            DevHub
          </h1>
        </div>

        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts, people..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="p-2 hover:bg-secondary rounded-full transition"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </button>
          <button
            className="p-2 hover:bg-secondary rounded-full transition"
            title="Messages"
          >
            <MessageCircle className="h-5 w-5 text-foreground" />
          </button>
          <LanguageToggle />
          <ModeToggle />
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center ml-2 flex-shrink-0 cursor-pointer hover:shadow-lg transition">
            <span className="text-primary-foreground text-sm font-bold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}
