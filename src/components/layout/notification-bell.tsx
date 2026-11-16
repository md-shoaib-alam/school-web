"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CreditCard, Trash2, UserX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
  type: string;
  isRead: boolean;
}

// The FCM foreground handler fires this so the badge updates instantly;
// the poll below is only the fallback for pushes the tab missed.
export const NOTIFICATIONS_REFRESH_EVENT = "app:notifications-refresh";

const FAST_POLL_MS = 60_000;
const SLOW_POLL_MS = 5 * 60_000;

function timeAgo(value: string | Date): string {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

function typeTint(type: string): { icon: React.ReactNode; cls: string } {
  if (type === "absence" || type === "attendance_alert") {
    return { icon: <UserX className="size-[19px]" />, cls: "bg-destructive/10 text-destructive" };
  }
  if (type === "fee" || type === "fee_due" || type === "subscription" || type === "subscription_alert") {
    return { icon: <CreditCard className="size-[19px]" />, cls: "bg-warning/10 text-warning" };
  }
  return { icon: <Bell className="size-[19px]" />, cls: "bg-brand/10 text-brand" };
}

export function NotificationBell() {
  const currentUser = useAppStore((s) => s.currentUser);
  const currentUserId = currentUser?.id;

  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const unreadRef = useRef(0);
  useEffect(() => {
    unreadRef.current = unread;
  }, [unread]);

  const refreshCount = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await apiFetch("/api/notifications/count");
      if (res.ok) {
        const data = await res.json();
        setUnread(Number(data?.unread) || 0);
      }
    } catch {
      // Badge refresh is best-effort; the next poll retries.
    }
  }, [currentUserId]);

  const loadList = useCallback(async () => {
    if (!currentUserId) return;
    setLoadingList(true);
    try {
      const res = await apiFetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch {
      // Keep whatever list is already shown.
    } finally {
      setLoadingList(false);
    }
  }, [currentUserId]);

  // Badge: fetch on login, on tab re-focus, on push, then adaptive poll while
  // the tab is visible only — 60s with unreads, 5min when at zero, zero
  // requests for backgrounded tabs.
  useEffect(() => {
    if (!currentUserId) {
      setUnread(0);
      setItems([]);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      timer = setTimeout(async () => {
        if (cancelled) return;
        if (document.visibilityState === "visible") await refreshCount();
        if (!cancelled) scheduleNext();
      }, unreadRef.current === 0 ? SLOW_POLL_MS : FAST_POLL_MS);
    };

    void refreshCount().then(() => {
      if (!cancelled) scheduleNext();
    });

    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshCount();
    };
    const onRefreshEvent = () => void refreshCount();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefreshEvent);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefreshEvent);
    };
  }, [currentUserId, refreshCount]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void loadList();
  };

  const markAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;

    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
    setUnread((prev) => Math.max(0, prev - 1));
    unreadRef.current = Math.max(0, unreadRef.current - 1);

    try {
      await apiFetch(`/api/notifications/${encodeURIComponent(item.id)}/read`, { method: "PATCH" });
      void refreshCount();
    } catch {
      // Best-effort; converges on next refresh
    }
  };

  const dismiss = async (item: NotificationItem) => {
    setHiddenIds((prev) => new Set(prev).add(item.id));
    if (!item.isRead) {
      setUnread((prev) => Math.max(0, prev - 1));
      unreadRef.current = Math.max(0, unreadRef.current - 1);
    }
    try {
      if (item.id.startsWith("transient_")) {
        await apiFetch(`/api/notifications/transient/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      } else if (!item.isRead) {
        await apiFetch(`/api/notifications/${encodeURIComponent(item.id)}/read`, { method: "PATCH" });
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      }
      void refreshCount();
    } catch {
      // UI already hid it; server state converges on next open.
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setHiddenIds(new Set());
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setUnread(0);
      unreadRef.current = 0;
      void refreshCount();
    } catch {
      void refreshCount();
    }
  };

  const clearAll = async () => {
    setItems([]);
    setUnread(0);
    unreadRef.current = 0;
    try {
      await apiFetch("/api/notifications", { method: "DELETE" });
    } catch {
      void refreshCount();
    }
  };

  const visibleItems = items.filter((n) => !hiddenIds.has(n.id));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          aria-expanded={open}
          className={cn(
            "relative size-8.5 sm:size-9 shrink-0 rounded-xl border bg-card/80 text-foreground hover:bg-muted shadow-2xs cursor-pointer p-0",
            open && "ring-2 ring-brand ring-offset-2 ring-offset-background"
          )}
        >
          <Bell className="size-4" strokeWidth={1.9} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full border border-background bg-brand px-0.5 text-[10px] font-semibold leading-none text-brand-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={12}
        sideOffset={10}
        className={cn(
          "w-[calc(100vw-1.5rem)] sm:w-[400px] overflow-hidden rounded-[24px] border-border p-0 gap-0",
          "bg-[radial-gradient(120%_100%_at_80%_0%,var(--card),var(--background)_62%)]",
          "shadow-[0_26px_50px_-16px_rgba(0,0,0,0.35)] dark:shadow-[0_26px_50px_-16px_rgba(0,0,0,0.65)]"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 pt-4 pb-3">
          <h2 className="text-base font-semibold tracking-tight">Notifications</h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-[10px] px-2 text-[13px] text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
              disabled={items.length === 0}
              title="Mark all as read"
            >
              <Check className="size-4" /> Read all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-[10px] px-2 text-[13px] text-muted-foreground hover:text-foreground"
              onClick={clearAll}
              disabled={items.length === 0}
              title="Clear all notifications"
            >
              <Trash2 className="size-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border)_transparent]">
          {loadingList && visibleItems.length === 0 && (
            <div className="px-4 py-9 text-center text-sm text-muted-foreground">Loading…</div>
          )}
          {!loadingList && visibleItems.length === 0 && (
            <div className="px-5 py-9 text-center">
              <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                <Check className="size-5" strokeWidth={2} />
              </span>
              <p className="text-sm text-muted-foreground">You're all caught up</p>
            </div>
          )}
          {visibleItems.map((item) => {
            const tint = typeTint(item.type);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => markAsRead(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    markAsRead(item);
                  }
                }}
                className={cn(
                  "group relative flex items-start gap-3 border-b border-border/60 px-4 py-3.5 transition-colors last:border-b-0 cursor-pointer hover:bg-muted/60 outline-none focus-visible:bg-muted/70",
                  !item.isRead ? "bg-brand/5 hover:bg-brand/10" : "opacity-80 hover:opacity-100"
                )}
              >
                <span
                  className={cn(
                    "mt-3.5 size-2 shrink-0 rounded-full transition-colors",
                    item.isRead ? "bg-transparent" : "bg-brand shadow-[0_0_8px_var(--brand)]"
                  )}
                />
                <span className={cn("grid size-[38px] shrink-0 place-items-center rounded-xl", tint.cls)}>
                  {tint.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold tracking-tight">{item.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                    {item.content}
                  </p>
                  <div className="mt-1.5 text-xs text-muted-foreground/80">
                    {timeAgo(item.createdAt)}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismiss(item);
                  }}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus:opacity-100 group-hover:opacity-100 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
