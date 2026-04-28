"use client";

import { useState } from "react";
import { Bell, ClipboardList, IndianRupee, Calendar, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useAppStore } from "@/store/use-app-store";
import { useEffect } from "react";

// Mock notification data
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Mid-Term Exam Schedule",
    desc: "Exams start from March 15. Check the schedule.",
    time: "2 min ago",
    read: false,
    icon: <ClipboardList className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 2,
    title: "Fee Payment Reminder",
    desc: "Pending fees due by March 31.",
    time: "1 hour ago",
    read: false,
    icon: <IndianRupee className="h-4 w-4 text-amber-500" />,
  },
  {
    id: 3,
    title: "Annual Day Celebration",
    desc: "Annual day on March 20. All students participate.",
    time: "3 hours ago",
    read: false,
    icon: <Calendar className="h-4 w-4 text-emerald-500" />,
  },
  {
    id: 4,
    title: "New Notice Posted",
    desc: "PTM scheduled for next Saturday.",
    time: "Yesterday",
    read: true,
    icon: <Bell className="h-4 w-4 text-violet-500" />,
  },
  {
    id: 5,
    title: "Attendance Report",
    desc: "Weekly attendance report is now available.",
    time: "2 days ago",
    read: true,
    icon: <UserCheck className="h-4 w-4 text-rose-500" />,
  },
];

export function NotificationBell() {
  const { currentUser } = useAppStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const res = await apiFetch("/api/notices");
      if (res.ok) {
        const rawNotices = await res.json();
        
        // Get read status from localStorage
        const seenIds = JSON.parse(localStorage.getItem('seen_notices') || '[]');
        
        // Map and filter for unread + 10 latest
        const mapped = rawNotices
          .filter((n: any) => !seenIds.map(String).includes(String(n.id))) // Only unread
          .sort((a: any, b: any) => new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()) // Latest first
          .slice(0, 10) // Only 10 latest
          .map((n: any) => ({
            id: String(n.id),
            title: n.title,
            desc: n.content || n.description || "No content available",
            time: (n.created_at || n.createdAt) ? formatDistanceToNow(new Date(n.created_at || n.createdAt), { addSuffix: true }) : "recently",
            read: false,
            icon: <Bell className="h-4 w-4 text-rose-500" />,
          }));

        setNotifications(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotices();
    }
  }, [open]);

  // Initial fetch for count
  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.length;

  const markAllRead = () => {
    const ids = notifications.map(n => n.id);
    const seenIds = JSON.parse(localStorage.getItem('seen_notices') || '[]');
    const updatedSeen = Array.from(new Set([...seenIds, ...ids]));
    localStorage.setItem('seen_notices', JSON.stringify(updatedSeen));
    setNotifications([]);
  };

  const markRead = (id: string | number) => {
    const sId = String(id);
    const seenIds = JSON.parse(localStorage.getItem('seen_notices') || '[]');
    if (!seenIds.map(String).includes(sId)) {
      seenIds.push(sId);
      localStorage.setItem('seen_notices', JSON.stringify(seenIds));
    }
    setNotifications(prev => prev.filter(n => String(n.id) !== sId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 md:h-10 md:w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-7 w-7 md:h-6 md:w-6 text-gray-500 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 sm:w-80 p-0 border-gray-200 dark:border-gray-800 shadow-2xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-semibold">
                {unreadCount} new
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 h-6 px-1.5"
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-[380px] overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
              <p className="text-xs text-gray-400 mt-2">Checking notices...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-3">
                <Bell className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">No new notices</p>
              <p className="text-[11px] opacity-60">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={cn(
                    "w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    !notification.read && "bg-blue-50/50 dark:bg-blue-900/10",
                  )}
                  onClick={() => markRead(notification.id)}
                >
                  <div className="mt-0.5 shrink-0 scale-90">{notification.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs truncate",
                          !notification.read
                            ? "font-semibold text-gray-900 dark:text-gray-100"
                            : "font-medium text-gray-700 dark:text-gray-300",
                        )}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 leading-tight">
                      {notification.desc}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {notification.time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
