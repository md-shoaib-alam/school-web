"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BellRing, Send, Check } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AbsencePushPreviewModalProps {
  studentName?: string;
  className?: string;
  teacherName?: string | null;
  teacherPhone?: string | null;
}

export function AbsencePushPreviewModal({
  studentName = "Student",
  className,
  teacherName,
  teacherPhone,
}: AbsencePushPreviewModalProps) {
  const [open, setOpen] = useState(false);
  const [iphoneLeaveSent, setIphoneLeaveSent] = useState(false);
  const [iphoneCalling, setIphoneCalling] = useState(false);
  const [androidLeaveSent, setAndroidLeaveSent] = useState(false);
  const [androidCalling, setAndroidCalling] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const teacherDisplayName = teacherName || "Class Teacher";
  const classDisplayName = className ? ` (${className})` : "";

  const handleSendTestPush = async () => {
    setIsSending(true);
    try {
      const res = await api.post<any>("/attendance/test-absence-push", {
        studentName,
        className,
        teacherName,
        teacherPhone,
        periodName: "Period 1",
      });
      if (res?.details?.tokensFound > 0) {
        toast.success(`Push notification sent to ${res.details.tokensFound} registered device(s)!`);
      } else {
        toast.success("Push notification payload generated successfully (no mobile device token registered yet for this account).");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger test push");
    } finally {
      setIsSending(false);
    }
  };

  // Dev-only aid: hidden in production builds (see src/temp/README.md).
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-semibold bg-card hover:bg-accent border shadow-xs gap-1.5 h-8 px-3 rounded-lg"
        >
          <BellRing className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Test Absence Push</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border shadow-2xl p-5 sm:p-6">
        <DialogHeader className="text-left pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Absence Push Notification Preview
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exact push notification UI sent to parents on iOS and Android when a student is absent
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleSendTestPush}
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-8 px-3 rounded-lg shadow-xs"
            >
              <Send className="size-3.5 mr-1.5" />
              {isSending ? "Sending…" : "Trigger Test Push"}
            </Button>
          </div>
        </DialogHeader>

        {/* Previews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* 1. iPhone Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                iPhone (iOS Lockscreen / Banner)
              </span>
              <span className="text-[11px] text-muted-foreground">Dark Glass</span>
            </div>

            {/* iOS Wallpaper Frame */}
            <div className="rounded-3xl p-4 bg-gradient-to-br from-[#1c2e4a] via-[#10243b] to-[#0a1118] border border-white/10 shadow-xl">
              <div className="rounded-2xl bg-[rgba(30,41,59,0.75)] backdrop-blur-xl border border-white/10 p-3.5 shadow-2xl text-white">
                <div className="flex gap-2.5">
                  {/* Icon */}
                  <div className="size-9 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md">
                    S
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between text-[11px] text-white/70 mb-0.5">
                      <span>School App</span>
                      <span>now</span>
                    </div>
                    <strong className="block text-sm font-semibold tracking-tight text-white">
                      {studentName}
                    </strong>
                    <p className="text-xs text-white/90 mt-0.5 leading-snug">
                      Marked absent from Period 1 by {teacherDisplayName}{classDisplayName}.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIphoneLeaveSent(true);
                      toast.success(`Leave request applied for ${studentName}`);
                    }}
                    className="h-8 rounded-xl bg-[#2C65E0] hover:bg-[#1E4DB7] text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {iphoneLeaveSent ? "Leave sent" : "Apply Leave"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIphoneCalling(true);
                      toast.info(`Opening attendance record for ${studentName}...`);
                    }}
                    className="h-8 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    {iphoneCalling ? "Opening…" : "View Attendance"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Android Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Android (Notification Shade)
              </span>
              <span className="text-[11px] text-muted-foreground">Light Card</span>
            </div>

            {/* Android Wallpaper Frame */}
            <div className="rounded-3xl p-4 bg-gradient-to-br from-[#e6e6e6] to-[#cdcdcd] border border-black/10 shadow-xl">
              <div className="rounded-[26px] bg-[#f4f4f4] border border-black/5 p-3.5 shadow-lg text-[#1a1a1a]">
                <div className="flex gap-2.5">
                  {/* Icon */}
                  <div className="size-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                    S
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[11px] text-black/60 mb-0.5">
                      School App · now
                    </div>
                    <strong className="block text-sm font-semibold tracking-tight text-[#1a1a1a]">
                      {studentName}
                    </strong>
                    <p className="text-xs text-[#333333] mt-0.5 leading-snug">
                      Marked absent from Period 1 by {teacherDisplayName}{classDisplayName}.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-6 mt-2 ml-8 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAndroidLeaveSent(true);
                      toast.success(`Leave request applied for ${studentName}`);
                    }}
                    className="text-xs font-semibold text-[#2C65E0] hover:text-[#1E4DB7] transition-colors cursor-pointer py-1"
                  >
                    {androidLeaveSent ? "Leave sent" : "Apply Leave"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAndroidCalling(true);
                      toast.info(`Opening attendance record for ${studentName}...`);
                    }}
                    className="text-xs font-semibold text-[#1a1a1a] hover:text-[#2C65E0] transition-colors cursor-pointer py-1"
                  >
                    {androidCalling ? "Opening…" : "View Attendance"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-4 p-3 rounded-xl bg-muted/50 border text-xs text-muted-foreground text-left space-y-1">
          <p className="font-semibold text-foreground">Interactive Push Actions Summary:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Apply Leave</strong>: Automatically launches the app directly into the leave request screen with student details pre-filled.</li>
            <li><strong>View Attendance</strong>: Directly opens the student attendance tab for detailed breakdown and historical logs.</li>
            <li><strong>Category Registered</strong>: Both APNs (iOS) and FCM (Android) are configured with the category identifier <code className="bg-muted px-1 py-0.5 rounded font-mono text-[11px]">ABSENCE_ALERT</code>.</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

