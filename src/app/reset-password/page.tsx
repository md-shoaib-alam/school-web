'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ShieldCheck, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useRequestPasswordReset } from '@/lib/graphql/hooks';
import { goeyToast as toast } from 'goey-toast';

/**
 * ResetPasswordPage (forgot password flow)
 * Premium UI following the SchoolSaaS design system.
 */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const resetMutation = useRequestPasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      await resetMutation.mutateAsync(email);
      setIsSuccess(true);
    } catch (err: any) {
      toast.error('The email address you entered is not registered in our system.');
    }
  };

  const isLoading = resetMutation.isPending;

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-100 via-slate-50 to-emerald-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-emerald-950/20">
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mb-6 rotate-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              Check your email
            </CardTitle>
            <CardDescription className="text-base pt-2">
              A secure link has been sent to <br />
              <span className="font-semibold text-slate-900 dark:text-white underline decoration-rose-500 decoration-2 underline-offset-4">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-4">
            <Button asChild className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300">
              <Link href="/">Return to Login</Link>
            </Button>
            <button 
              onClick={() => setIsSuccess(false)} 
              className="w-full text-center text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Didn't receive the email? Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-4 pt-12 sm:pt-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-100 via-slate-50 to-emerald-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-emerald-950/20">
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
        
        <CardHeader className="space-y-4 relative">
          <Link 
            href="/" 
            className="group flex items-center text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
          
          <div className="space-y-1">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-base">
              Enter your email and we'll send you instructions to reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold pl-1 text-slate-700 dark:text-slate-300">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sigel.edu"
                  className="pl-11 h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-rose-500/20 focus:border-rose-500 transition-all text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl font-bold shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending secure link...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Suddenly remembered? {' '}
              <Link href="/" className="text-slate-900 dark:text-white font-bold hover:underline decoration-rose-500 decoration-2 underline-offset-4 decoration-transparent hover:decoration-rose-500 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Background Ambience */}
      <div className="fixed top-1/4 -right-40 w-[500px] h-[500px] bg-rose-400/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-1/4 -left-40 w-[500px] h-[500px] bg-emerald-400/5 blur-[120px] pointer-events-none rounded-full" />
    </div>
  );
}
