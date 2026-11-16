"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useGraphQLMutation, SAVE_NOTIFICATION_TOKEN } from "@/lib/graphql/hooks";
import { NOTIFICATIONS_REFRESH_EVENT } from "@/components/layout/notification-bell";
import { AbsencePushBanner, type AbsenceNoticeItem } from "@/components/notifications/absence-push-banner";

const isAbsencePayload = (data: any) =>
  data?.type === "attendance_alert" || data?.categoryIdentifier === "ABSENCE_ALERT";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppStore();
  const currentUserId = currentUser?.id;
  const tenantSlug = currentUser?.tenantSlug || currentUser?.tenantId;
  const role = currentUser?.role;
  const tokenRef = useRef<string | null>(null);
  const router = useRouter();
  const { mutate: saveToken } = useGraphQLMutation(SAVE_NOTIFICATION_TOKEN);

  const [notices, setNotices] = useState<AbsenceNoticeItem[]>([]);

  const addNotice = useCallback((notice: AbsenceNoticeItem) => {
    setNotices((prev) => {
      // One card per unique push; different children arrive as different pushes.
      if (prev.some((n) => n.id === notice.id)) return prev;
      return [...prev, notice];
    });
  }, []);

  const dismissNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => setNotices([]), []);

  const openAttendance = useCallback(
    (data: Record<string, any>, id: string) => {
      dismissNotice(id);
      if (data?.studentId) {
        document.cookie = `lastSelectedStudent=${data.studentId}; path=/; max-age=31536000`;
      }
      const target = role === "parent" || role === "student" ? "attendance" : "dashboard";
      if (tenantSlug) router.push(`/${tenantSlug}/${target}`);
    },
    [dismissNotice, role, tenantSlug, router]
  );

  useEffect(() => {
    // We only ask for permission if the user is logged in
    if (currentUserId) {
      const initNotifications = async () => {
        try {
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
            tokenRef.current = fcmToken;
            // Save token to backend
            try {
              await saveToken({
                token: fcmToken,
                platform: "web"
              });
            } catch (saveErr) {
              console.warn("Could not register FCM notification token with backend:", saveErr);
            }
          }
        } catch (err) {
          console.error("Failed to initialize notifications", err);
        }
      };

      // Delay slightly to not interrupt the initial page load
      const timer = setTimeout(initNotifications, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentUserId, saveToken]);

  useEffect(() => {
    // Listen for messages while the app is open (foreground)
    const unsubscribe = onForegroundMessage((payload) => {
      const data = payload.data || {};
      const title = payload.notification?.title || data.title || "New Notification";
      const body = payload.notification?.body || data.body || "You have a new message";

      // Push is the real-time channel — tell the bell to refresh now instead
      // of waiting for its next poll.
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));

      if (isAbsencePayload(data)) {
        // Same card UI as the mobile app; system tray stays out of it while
        // the tab is focused (FCM never auto-displays foreground pushes).
        addNotice({
          id: payload.messageId || `${Date.now()}_${data.studentId || Math.random()}`,
          title,
          body,
          data,
        });
      } else {
        toast.success(title, {
          description: body,
          icon: <Bell className="size-5 text-violet-500" />,
          duration: 10000
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [addNotice]);

  // Background notification click: the service worker focuses this tab and
  // posts the payload; show the same in-app card instead of a bare redirect.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type !== "PUSH_NOTIFICATION_CLICK") return;
      const data = event.data.data || {};
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
      addNotice({
        id: data.studentId ? `absence_${data.studentId}` : `${Date.now()}_${Math.random()}`,
        title: data.studentName || data.title || "Attendance Alert",
        body: data.body || "Marked absent today.",
        data,
      });
    };
    navigator.serviceWorker.addEventListener("message", onSwMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onSwMessage);
  }, [addNotice]);

  // Cold start: the SW had no window to focus, so it opened /?push=<payload>.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("push");
    if (!raw) return;
    params.delete("push");
    const clean = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (clean ? `?${clean}` : ""));
    try {
      const data = JSON.parse(raw);
      addNotice({
        id: data.studentId ? `absence_${data.studentId}` : `${Date.now()}`,
        title: data.studentName || data.title || "Attendance Alert",
        body: data.body || "Marked absent today.",
        data,
      });
    } catch {
      // Malformed payload — nothing to show.
    }
  }, [addNotice]);

  return (
    <>
      <AbsencePushBanner
        notices={notices}
        onDismissNotice={dismissNotice}
        onDismissAll={dismissAll}
        onApplyLeave={openAttendance}
        onViewAttendance={openAttendance}
      />
      {children}
    </>
  );
}
