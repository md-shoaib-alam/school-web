"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
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
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { loginWithElysia } from "@/lib/api";

function ThemeToggleLogin() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 size-10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 text-zinc-600 dark:text-zinc-300 z-10 cursor-pointer"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      <Moon className="size-5 block dark:hidden" />
      <Sun className="size-5 hidden dark:block" />
    </Button>
  );
}

export function LoginScreen() {
  const router = useRouter();
  const { login, setCurrentScreen } = useAppStore();

  // Login state
  const [loginMode, setLoginMode] = useState<"email" | "id">("id");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error(
        loginMode === "email"
          ? "Please enter both Email ID and password"
          : "Please enter both School ID/Phone and password"
      );
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
        const dashboardUrl = tenantId ? `/${tenantId}/dashboard` : "/dashboard";
        
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
      className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-zinc-50 via-white to-rose-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-rose-950"
      suppressHydrationWarning
    >
      <ThemeToggleLogin />

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-20 rounded-2xl mb-4 shadow-lg bg-white/90 dark:bg-black/20 overflow-hidden shrink-0 border border-zinc-200 dark:border-white/10">
            <Image 
              src="/test.webp" 
              alt="School Logo" 
              width={80}
              height={80}
              priority
              unoptimized
              className="size-full object-cover" 
            />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            SchoolSaaS
          </h1>
          <p className="text-lg mt-2 text-zinc-500 dark:text-zinc-400 font-medium">
            Welcome back! Sign in to continue
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/90 border-t border-t-white backdrop-blur-xl dark:bg-zinc-900/40 dark:border dark:border-white/[0.06] dark:shadow-black/50 rounded-2xl overflow-hidden relative transition-all duration-300">
          {/* Subtle luxury gradient top border for dark mode */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
          
          <CardHeader className="text-center pt-8 pb-3">
            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white/90">
              Login to your account
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-7 pb-8 pt-4">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="login-email"
                  className="text-sm font-semibold pl-1 text-zinc-700 dark:text-zinc-300/90"
                >
                  {loginMode === "email" ? "Email Address" : "School ID or Mobile Number"}
                </Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-zinc-400 group-focus-within:text-rose-500 transition-colors duration-200">
                    {loginMode === "email" ? (
                      <Mail className="size-4" />
                    ) : (
                      <>
                        <School className="size-4" />
                        <span className="text-xs">/</span>
                        <Phone className="size-4" />
                      </>
                    )}
                  </div>
                  <Input
                    id="login-email"
                    type="text"
                    placeholder={loginMode === "email" ? "Email Address" : "School ID or Mobile"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-zinc-50/50 dark:bg-[#0c0c0e]/70 dark:border-zinc-800/60 dark:text-zinc-100 ${
                      loginMode === "email" ? "pl-11" : "pl-16"
                    } h-12 rounded-xl focus:ring-rose-500/15 focus:border-rose-500 dark:focus:ring-rose-500/20 dark:focus:border-rose-500/60 transition-all duration-200 placeholder:text-zinc-400/70`}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="login-password"
                  className="text-sm font-semibold pl-1 text-zinc-700 dark:text-zinc-300/90"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-zinc-400 group-focus-within:text-rose-500 transition-colors duration-200" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-50/50 dark:bg-[#0c0c0e]/70 dark:border-zinc-800/60 dark:text-zinc-100 pl-11 pr-11 h-12 rounded-xl focus:ring-rose-500/15 focus:border-rose-500 dark:focus:ring-rose-500/20 dark:focus:border-rose-500/60 transition-all duration-200 placeholder:text-zinc-400/70"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end px-1 pt-1">
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/reset-password")}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400/90 dark:hover:text-rose-300 transition-colors duration-200 cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 hover:bg-zinc-850 dark:bg-rose-600 dark:hover:bg-rose-500 text-white h-12 text-base font-bold rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-250 active:scale-[0.97] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMode(loginMode === "email" ? "id" : "email");
                      setEmail("");
                    }}
                    className="text-sm font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400/90 dark:hover:text-rose-300 transition-colors duration-200 cursor-pointer"
                  >
                    {loginMode === "email" ? "Login by School ID/Phone" : "Login by Email ID"}
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs mt-8 text-zinc-400 dark:text-zinc-600 font-medium">
          For assistance, please contact your school administration.
        </p>
      </div>
    </div>
  );
}
