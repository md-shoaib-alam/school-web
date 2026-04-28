"use client";

import { useState } from "react";
import { Bell, ClipboardList, IndianRupee, Calendar, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
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
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No notifications</p>
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
