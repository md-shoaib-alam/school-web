"use client";

import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Home,
  ArrowLeft,
  RefreshCw,
  LogOut,
} from "lucide-react";

export function NotFoundScreen() {
  const { setCurrentScreen, logout } = useAppStore();

  const goHome = () => {
    setCurrentScreen("dashboard");
  };

  const goBack = () => {
    window.history.back();
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const goLogin = () => {
    logout();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Animated floating illustration */}
        <div className="relative mb-8">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 flex items-center justify-center animate-[ping_2s_ease-in-out_infinite]">
            <div className="w-48 h-48 rounded-full bg-rose-100 dark:bg-rose-950/30 opacity-20" />
          </div>

          {/* Middle ring */}
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <div className="w-36 h-36 rounded-full bg-emerald-100 dark:bg-emerald-950/30 opacity-30" />
          </div>

          {/* Main icon container */}
          <div className="relative inline-flex items-center justify-center w-28 h-28 animate-[scale-in_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards] opacity-0">
            <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-2xl shadow-rose-300/50 dark:shadow-rose-900/50" />
            <div className="relative z-10 text-white">
              <GraduationCap className="w-14 h-14" />
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-2 -left-4 w-8 h-8 rounded-lg bg-amber-400 dark:bg-amber-500 flex items-center justify-center shadow-lg animate-[float-bounce_3s_ease-in-out_infinite]">
            <span className="text-white text-sm font-bold">?</span>
          </div>
          <div className="absolute -bottom-1 -right-4 w-8 h-8 rounded-lg bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow-lg animate-[float-bounce_3s_ease-in-out_1s_infinite]">
            <span className="text-white text-lg">!</span>
          </div>
        </div>

        {/* 404 Number */}
        <h1 className="text-8xl font-black tracking-tighter animate-[fade-up_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_forwards] opacity-0">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500">
            404
          </span>
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 animate-[fade-up_0.6s_ease-out_0.5s_forwards] opacity-0">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 mt-3 text-base leading-relaxed animate-[fade-up_0.6s_ease-out_0.65s_forwards] opacity-0">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
          <br />
          Let&apos;s get you back on track!
        </p>

        {/* 4 Action buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-3 mt-8 animate-[fade-up_0.6s_ease-out_0.8s_forwards] opacity-0">
          <Button
            onClick={goHome}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button
            variant="outline"
            onClick={goBack}
            className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={refreshPage}
            className="gap-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            onClick={goLogin}
            className="gap-2 text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Decorative bottom text */}
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-10 animate-[fade-in_0.5s_ease_1s_forwards] opacity-0">
          SchoolSaaS — If you think this is a mistake, please contact support.
        </p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float-bounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
