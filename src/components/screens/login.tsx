"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useAppStore, type UserRole } from "@/store/use-app-store";
import { setCookie } from "@/lib/cookies";
import { SESSION_EXPIRY_DAYS } from "@/store/app-store/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  School,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { loginWithElysia } from "@/lib/api";

function ThemeToggleLogin() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 h-10 w-10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 text-gray-600 dark:text-gray-300 z-10"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Moon className="h-5 w-5 block dark:hidden" />
      <Sun className="h-5 w-5 hidden dark:block" />
    </Button>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const { login, setCurrentScreen } = useAppStore();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    
    // Create the login promise
    const loginPromise = loginWithElysia(email.trim(), password.trim());

    toast.promise(loginPromise, {
      loading: "Authenticating...",
      success: (data) => {
        const userData = data.user;
        const token = data.token;

        if (token) {
          localStorage.setItem("school_token", token);
          setCookie("school_token", token, SESSION_EXPIRY_DAYS);
        }

        login({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole,
          avatar: userData.avatar,
          tenantId: userData.tenantId,
          tenantSlug: userData.tenantSlug,
          tenantName: userData.tenantName,
          customRole: userData.customRole || null,
        });

        const tenantId = userData.tenantSlug || userData.tenantId;
        const dashboardUrl = tenantId ? `/${tenantId}` : "/";
        
        // Use window.location.href for a clean entry after login
        window.location.href = dashboardUrl;

        return `Welcome back, ${userData.name}!`;
      },
      error: (err: any) => {
        setLoading(false);
        return err.message || "Authentication failed";
      },
    });

    try {
      await loginPromise;
    } catch {
      // Error handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-slate-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-rose-950"
      suppressHydrationWarning
    >
      <ThemeToggleLogin />

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white mb-4 shadow-lg bg-gradient-to-br from-rose-600 to-rose-700 shadow-rose-200 dark:shadow-rose-900/40">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            SchoolSaaS
          </h1>
          <p className="text-lg mt-2 text-gray-500 dark:text-gray-400">
            Multi-Tenant School Management Platform
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50 px-3 py-1 rounded-full">
              SaaS Platform
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 px-3 py-1 rounded-full">
              Multi-School
            </span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border dark:border-white/10">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Mail className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Login to your account
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="login-email"
                  className="text-sm font-semibold pl-1 text-gray-700 dark:text-gray-300"
                >
                  Email or Mobile Number
                </Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400 group-focus-within:text-rose-500 transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">/</span>
                    <School className="h-4 w-4" />
                  </div>
                  <Input
                    id="login-email"
                    type="text"
                    placeholder="Email or Mobile"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50/50 dark:bg-gray-950/50 dark:border-gray-800 dark:text-gray-100 pl-16 h-12 rounded-xl focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/reset-password")}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-50/50 dark:bg-gray-950/50 dark:border-gray-800 dark:text-gray-100 pl-11 pr-11 h-12 rounded-xl focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white h-12 text-base font-bold rounded-xl shadow-lg shadow-rose-500/10 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs mt-8 text-gray-400 dark:text-gray-600 font-medium">
          &copy; {new Date().getFullYear()} SchoolSaaS Platform. Secure
          Multi-Tenant Architecture.
        </p>
      </div>
    </div>
  );
}
