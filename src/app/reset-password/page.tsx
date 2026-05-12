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
      <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-slate-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-rose-950">
        <Card className="w-full max-w-md border-0 bg-white/90 border-t border-t-white backdrop-blur-xl dark:bg-gray-900/40 dark:border dark:border-white/[0.06] dark:shadow-black/50 rounded-2xl overflow-hidden relative shadow-2xl">
          {/* Subtle luxury gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          
          <CardHeader className="text-center pt-8 pb-2">
            <div className="mx-auto w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl flex items-center justify-center mb-6 shadow-md border border-emerald-100 dark:border-emerald-900/50 rotate-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/95">
              Check your email
            </CardTitle>
            <CardDescription className="text-base pt-2 text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              A secure link has been sent to <br />
              <span className="font-semibold text-slate-900 dark:text-white underline decoration-emerald-500 decoration-1 underline-offset-4">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-6 space-y-4">
            <Button asChild className="w-full h-12 bg-slate-900 hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white rounded-xl font-bold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-250 active:scale-[0.97] cursor-pointer">
              <Link href="/">Return to Login</Link>
            </Button>
            <button 
              onClick={() => setIsSuccess(false)} 
              className="w-full text-center text-sm text-rose-500 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
            >
              Didn't receive the email? Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-slate-50 via-white to-rose-50 dark:from-gray-950 dark:via-gray-900 dark:to-rose-950">
      <Card className="w-full max-w-md border-0 bg-white/90 border-t border-t-white backdrop-blur-xl dark:bg-gray-900/40 dark:border dark:border-white/[0.06] dark:shadow-black/50 rounded-2xl overflow-hidden relative shadow-2xl transition-all duration-300">
        {/* Subtle luxury gradient top border for dark mode */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent" />
        
        <CardHeader className="space-y-5 relative px-8 pt-8 pb-4">
          <Link 
            href="/" 
            className="group flex items-center text-sm font-medium text-slate-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 transition-colors w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </Link>
          
          <div className="space-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/20">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white/95">
              Forgot password?
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-gray-400/90 text-sm font-medium leading-relaxed">
              Enter your email and we'll send you instructions to reset your password.
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 pt-2 relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold pl-1 text-slate-700 dark:text-gray-300/90">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors duration-200" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sigel.edu"
                  className="pl-11 h-12 bg-gray-50/50 dark:bg-[#0c0c0e]/70 dark:border-gray-800/60 dark:text-gray-100 rounded-xl focus:ring-rose-500/15 focus:border-rose-500 dark:focus:ring-rose-500/20 dark:focus:border-rose-500/60 transition-all duration-200 text-base placeholder:text-gray-400/70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-12 bg-slate-900 hover:bg-slate-850 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-250 active:scale-[0.97] cursor-pointer disabled:opacity-50"
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

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.05] text-center">
            <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
              Suddenly remembered? {' '}
              <Link href="/" className="text-rose-500 dark:text-rose-400 font-semibold hover:text-rose-600 transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
