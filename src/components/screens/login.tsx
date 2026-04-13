'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAppStore, type UserRole } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2,
  School
} from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

function ThemeToggleLogin() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 h-10 w-10 rounded-full hover:bg-white/20 dark:hover:bg-black/20 text-gray-600 dark:text-gray-300 z-10"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error);
        setLoading(false);
        return;
      }

      // Success - Fetch user data for the store
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      const userData = data.user;
      const token = data.token;

      // Save token for GraphQL & mobile-ready Auth
      if (token) {
        localStorage.setItem('school_token', token);
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
      const dashboardUrl = userData.tenantId ? `/${userData.tenantId}` : '/';
      router.push(dashboardUrl);
      
      toast.success(`Welcome back, ${userData.name}!`);
    } catch (err: any) {
      toast.error(err.message || 'Network error. Please try again.');
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
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-white mb-4 shadow-lg bg-gradient-to-br from-rose-600 to-rose-700 shadow-rose-200 dark:shadow-rose-900/40">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">SchoolSaaS</h1>
          <p className="text-lg mt-2 text-gray-500 dark:text-gray-400">Multi-Tenant School Management Platform</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50 px-3 py-1 rounded-full">
              SaaS Platform
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 px-3 py-1 rounded-full">
              Multi-School
            </span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl dark:bg-gray-900/80 dark:border dark:border-white/10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Mail className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Login to your account</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-semibold pl-1 text-gray-700 dark:text-gray-300">Email or Mobile Number</Label>
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
                  <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/reset-password'}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  'Sign In'
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100 dark:border-white/5" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                  <span className="bg-white dark:bg-gray-900 px-3 text-muted-foreground/60">Professional Login Only</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 gap-3 border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl font-semibold transition-all"
                onClick={() => signIn('google')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs mt-8 text-gray-400 dark:text-gray-600 font-medium">
          &copy; {new Date().getFullYear()} SchoolSaaS Platform. Secure Multi-Tenant Architecture.
        </p>
      </div>
    </div>
  );
}
