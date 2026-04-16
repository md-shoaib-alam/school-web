"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useAppStore, type UserRole } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  Phone,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { loginWithElysia } from "@/lib/api";

export function LoginScreen() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { login } = useAppStore();

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
    try {
      // Direct login via Elysia backend — no NextAuth needed
      const data = await loginWithElysia(email.trim(), password.trim());

      const userData = data.user;
      const token = data.token;

      // Save token for GraphQL & mobile-ready Auth
      if (token) {
        localStorage.setItem("school_token", token);
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

      // Navigate using the proper Next.js router
      const dashboardUrl = userData.tenantSlug 
        ? `/${userData.tenantSlug}` 
        : userData.tenantId 
          ? `/${userData.tenantId}` 
          : "/";
      router.push(dashboardUrl);

      toast.success(`Welcome back, ${userData.name}!`);
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const heroImageSrc = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2160&q=80";

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-full overflow-hidden bg-background text-foreground transition-all duration-500 p-4 md:p-6">
      
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-10 right-10 h-10 w-10 md:h-11 md:w-11 rounded-xl bg-muted hover:bg-muted/80 z-50 group border border-border"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        <Moon className="h-4 w-4 block dark:hidden transition-transform group-hover:rotate-12" />
        <Sun className="h-4 w-4 hidden dark:block transition-transform group-hover:rotate-90" />
      </Button>

      {/* Left Column: Hero Image (Curved Corners / Image Left) */}
      <section className="hidden md:block flex-[1.1] lg:flex-[1.3] relative h-full">
         <div 
          className="w-full h-full bg-cover bg-center rounded-[2.5rem] overflow-hidden border border-border/40 shadow-xl" 
          style={{ backgroundImage: `url(${heroImageSrc})` }}
        >
          <div className="absolute inset-0 bg-rose-600/5 dark:bg-black/30" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-black/60 via-transparent to-transparent">
             <div className="max-w-md">
                <div className="p-2.5 bg-rose-600 rounded-xl w-fit mb-4 shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Modern School Hub.
                </h2>
                <p className="text-rose-100/80 mt-2 text-base font-medium">
                   Access your central management portal.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Right Column: Login Form (Medium Size / Static) */}
      <section className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <div className="flex flex-col gap-10">
            
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-5xl font-black tracking-tighter text-foreground leading-tight">
                Welcome
              </h1>
              <p className="text-muted-foreground font-medium text-base whitespace-nowrap overflow-hidden text-ellipsis">
                Access your account and continue your journey with us
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="login-email" className="text-sm font-bold text-foreground/80 pl-0.5 uppercase tracking-widest text-[11px]">
                  Email or Mobile Number
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                    <Mail className="w-5 h-5" />
                    <span className="mx-2 text-border select-none opacity-40">|</span>
                    <Phone className="w-5 h-5" />
                  </div>
                  <input 
                    id="login-email"
                    type="text" 
                    placeholder="e.g. name@school.com or +123" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-muted/40 border border-border h-14 pl-24 pr-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500 transition-all font-semibold text-[13px]"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="login-password" title="Password" className="text-sm font-bold text-foreground/80 pl-0.5 uppercase tracking-widest text-[11px]" />
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-rose-600 transition-colors" />
                  <input 
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-muted/40 border border-border h-14 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500 transition-all font-semibold text-[13px]"
                    required 
                  />
                  <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-rose-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-0.5 text-xs font-bold">
                 <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="h-5 w-5 rounded border-border bg-muted checked:bg-rose-600 transition-all cursor-pointer" />
                  <span className="text-muted-foreground group-hover:text-foreground">Keep me signed in</span>
                </label>
                <button
                    type="button"
                    onClick={() => router.push("/reset-password")}
                    className="text-rose-600 hover:text-rose-700 transition-colors text-right font-black"
                  >
                    Reset password
                  </button>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-lg rounded-xl shadow-md shadow-rose-500/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                        Sign In
                    </>
                )}
              </Button>
            </form>

            <div className="pt-8 text-center border-t border-border/50">
               <p className="text-sm text-muted-foreground font-medium">
                    Don't have an account? <span className="text-rose-600 font-bold cursor-pointer hover:underline underline-offset-4 decoration-2">Contact your school administrator.</span>
                </p>
                <p className="mt-8 text-[9px] font-bold text-[#888888] uppercase tracking-[0.2em] opacity-60">
                   &copy; {new Date().getFullYear()} SchoolSaaS Infrastructure
                </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
