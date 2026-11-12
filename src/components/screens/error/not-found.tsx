"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAppStore } from "@/store/use-app-store";
import { LogOut } from "lucide-react";

export function NotFoundScreen() {
  const { push } = useRouter();
  const { logout, isLoggedIn } = useAppStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const goHome = () => {
    push("/");
  };

  const handleLogout = () => {
    window.location.href = logout() ?? "/";
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between py-12 px-6 bg-background transition-colors duration-300">

      {/* Top Section: Recreated Premium Logo */}
      <div className="w-full flex justify-center animate-[fade-down_0.8s_ease-out_forwards]">
        <div className="relative w-64 h-20 transition-transform duration-300 hover:scale-102">
          <Image
            src="/logo.svg"
            alt="School Aura Logo"
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-contain dark:invert-[0.05]"
            priority
          />
        </div>
      </div>

      {/* Middle Section: SVG Illustration */}
      <div className="flex-1 flex items-center justify-center my-8 w-full max-w-4xl animate-[scale-in_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-lg">
          <div className="relative w-full aspect-[300/108] max-h-[45vh] mx-auto">
            <Image
              src="/404 page.svg"
              alt="404 - Page Not Found"
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="w-full flex flex-col items-center gap-5 animate-[fade-up_0.8s_ease-out_0.2s_forwards] opacity-0">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={goHome}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all duration-300 ease-spring hover:-translate-y-px active:scale-[0.97] active:translate-y-0 cursor-pointer"
          >
            Back to Home
          </button>

          {mounted && isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              className="h-10 px-6 rounded-xl bg-card hover:bg-accent text-foreground font-semibold text-sm border border-border shadow-xs transition-all duration-300 ease-spring hover:-translate-y-px active:scale-[0.97] active:translate-y-0 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </button>
          )}
        </div>

        {/* Subtle Supporting Footer Text */}
        <p className="text-xs font-medium text-muted-foreground">
          School Aura OS &middot; If you think this is an error, please contact your administrator.
        </p>
      </div>

      {/* Inline styles for modern micro-animations */}
      <style>{`
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
