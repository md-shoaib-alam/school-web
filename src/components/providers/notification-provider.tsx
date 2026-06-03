"use client";

import { useEffect, useRef } from "react";
import { requestNotificationPermission, onForegroundMessage } from "@/lib/firebase";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useGraphQLMutation, SAVE_NOTIFICATION_TOKEN } from "@/lib/graphql/hooks";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppStore();
  const currentUserId = currentUser?.id;
  const tokenRef = useRef<string | null>(null);
  const { mutate: saveToken } = useGraphQLMutation(SAVE_NOTIFICATION_TOKEN);

  useEffect(() => {
    // We only ask for permission if the user is logged in
    if (currentUserId) {
      const initNotifications = async () => {
        try {
          const fcmToken = await requestNotificationPermission();
          if (fcmToken) {
            tokenRef.current = fcmToken;
            console.log("FCM Token Generated:", fcmToken);
            
            // Save token to backend
            saveToken({ 
              token: fcmToken, 
              platform: "web" 
            });
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
      console.log("New foreground message:", payload);
      
      // 1. Show Toast inside the App
      toast.success(payload.notification?.title || "New Notification", {
        description: payload.notification?.body || "You have a new message",
        icon: <Bell className="size-5 text-violet-500" />,
        duration: 10000
      });

      // 2. Show Native Browser Popup (if user is on another tab)
      if (Notification.permission === "granted") {
        new Notification(payload.notification?.title || "New Notification", {
          body: payload.notification?.body || "You have a new message",
          icon: "/logo.svg"
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
