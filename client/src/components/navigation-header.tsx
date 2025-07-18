import { useState } from "react";
import { useAuth, getAuthHeaders } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, ChevronDown, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function NavigationHeader() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Fetch real notification count
  const { data: notificationData } = useQuery({
    queryKey: ["/api/notifications/unread-count"],
    queryFn: async () => {
      const response = await fetch("/api/notifications/unread-count", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch notification count");
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notificationCount = notificationData?.count || 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isActivePage = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const getLinkClasses = (path: string) => {
    return isActivePage(path)
      ? "text-primary font-medium border-b-2 border-primary pb-1"
      : "text-slate-600 hover:text-primary transition-colors";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="text-primary text-xl" />
              <span className="text-xl font-bold text-slate-800">Campus Buddy</span>
            </div>
            <div className="hidden md:flex space-x-6 ml-8">
              <a href="/" className={getLinkClasses("/")}>
                Home
              </a>
              <a href="/navigation" className={getLinkClasses("/navigation")}>
                Navigation
              </a>
              <a href="/schedules" className={getLinkClasses("/schedules")}>
                Schedule
              </a>
              <a href="/timetable" className={getLinkClasses("/timetable")}>
                Timetable
              </a>
              <a href="/reminders" className={getLinkClasses("/reminders")}>
                Reminders
              </a>
              {(user?.role === "admin" || user?.role === "super_admin") && (
                <a href="/admin-portal" className={getLinkClasses("/admin-portal")}>
                  Admin Portal
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {user ? getInitials(user.fullName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                    {user?.fullName || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.fullName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Notification Preferences</DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}