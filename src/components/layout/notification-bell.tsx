"use client";

import { useState } from "react";
import { Bell, ClipboardList, IndianRupee, Calendar, UserCheck, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { useAppStore } from "@/store/use-app-store";
import { useEffect, useCallback } from "react";

// No mock data - only real notifications from the database

export function NotificationBell() {
  const { currentUser, currentTenantId } = useAppStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch("/api/notifications");
      if (res.ok) {
        const raw = await res.json();
        
        // Map push history to UI format
        const mapped = raw
          .map((n: any) => ({
            id: n.id,
            title: n.title,
            desc: n.content || "No content",
            time: n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : "recently",
            read: n.isRead,
            type: n.type,
            icon: n.type === 'platform_notice' 
              ? <Megaphone className={cn("h-4 w-4", n.isRead ? "text-gray-400" : "text-amber-500")} />
              : <Bell className={cn("h-4 w-4", n.isRead ? "text-gray-400" : "text-rose-500")} />,
          }));

        setNotifications(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (open) {
      fetchNotices();
    }
  }, [open, fetchNotices]);

  // Initial fetch for count + Event listener for real-time updates
  useEffect(() => {
    fetchNotices();

    const handleRefresh = () => {
      console.log("[BELL] Refreshing via WebSocket signal...");
      fetchNotices();
    };

    window.addEventListener('refresh-notifications', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-notifications', handleRefresh);
    };
  }, [fetchNotices]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markRead = async (id: string | number) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const clearAll = async () => {
    try {
      await apiFetch("/api/notifications", { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 md:h-10 md:w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Bell className={cn(
            "h-6 w-6 md:h-5 md:w-5 transition-colors",
            unreadCount > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"
          )} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2 items-center justify-center rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl overflow-hidden" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-5 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 tracking-tight">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold px-1.5 py-0">
                {unreadCount} NEW
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7 px-2 font-semibold text-gray-500 hover:text-indigo-600 transition-colors"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] h-7 px-2 font-semibold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              onClick={clearAll}
            >
              Clear
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-[420px]">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 opacity-20" />
              <p className="text-xs text-gray-400 mt-4 font-medium">Updating history...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-20 h-20 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-4 transform rotate-12 transition-transform hover:rotate-0">
                <Bell className="h-10 w-10 opacity-10" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">All caught up!</p>
              <p className="text-xs opacity-60 mt-1">Your notification center is empty</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative w-full flex items-start gap-4 px-5 py-4 text-left transition-all duration-200 cursor-pointer",
                    !notification.read 
                      ? "bg-indigo-50/30 dark:bg-indigo-900/5" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/30",
                  )}
                  onClick={() => markRead(notification.id)}
                >
                  <div className={cn(
                    "mt-0.5 shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                    !notification.read 
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" 
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  )}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        "text-[13px] leading-tight",
                        !notification.read
                          ? "font-bold text-gray-900 dark:text-gray-100"
                          : "font-medium text-gray-600 dark:text-gray-400",
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap mt-0.5 font-medium">
                        {notification.time}
                      </p>
                    </div>
                    <p className={cn(
                      "text-xs leading-relaxed line-clamp-2",
                      !notification.read ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"
                    )}>
                      {notification.desc}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              End of notifications
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

