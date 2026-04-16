"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, RefreshCw, CheckCircle2, Phone, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// --- MAIN COMPONENT ---

export default function ResetPasswordPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setIsSubmitted(true);
        toast.success("Instructions sent!");
    }, 1200);
  };

  const heroImageSrc = "https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80";

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-full overflow-hidden bg-background text-foreground transition-all duration-500 p-4 md:p-6">
      
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-10 right-10 h-10 w-10 md:h-11 md:w-11 rounded-xl bg-muted hover:bg-muted/80 z-50 group border border-border"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
                <div className="h-1 bg-rose-600 w-20 mb-4 rounded-full" />
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Recover Your Access.
                </h2>
                <p className="text-rose-100/90 mt-2 text-base font-medium italic">
                   "Simplicity is the soul of hardware."
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Right Column: Reset Form (Medium Size / Static) */}
      <section className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[440px]">
          <div className="flex flex-col gap-10">
            
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-rose-600 w-fit group transition-all text-[11px] font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Return to login
            </button>

            {!isSubmitted ? (
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black tracking-tighter text-foreground leading-tight">
                    <span className="font-light text-muted-foreground">Reset</span> Password
                  </h1>
                  <p className="text-muted-foreground font-medium text-base leading-snug">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-bold text-foreground/80 pl-0.5 uppercase tracking-widest text-[11px]">
                      Email or Mobile Number
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground group-focus-within:text-rose-600 transition-colors">
                        <Mail className="w-5 h-5" />
                        <span className="mx-2 text-border select-none opacity-40">|</span>
                        <Phone className="w-5 h-5" />
                      </div>
                      <input 
                        id="email"
                        type="text" 
                        placeholder="e.g. name@school.com or +123" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-muted/40 border border-border h-14 pl-24 pr-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500 transition-all font-semibold text-[13px]"
                        required 
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-rose-600 hover:bg-rose-700 text-white font-black text-lg rounded-xl shadow-md shadow-rose-500/10 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                        <>
                            Dispatch Link
                        </>
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-8 text-center py-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-4xl font-black tracking-tighter text-foreground text-center">Instructions Sent</h2>
                  <p className="text-muted-foreground font-medium text-base leading-snug px-4">
                    Check your portal at <br/>
                    <span className="text-foreground font-bold underline decoration-rose-500 underline-offset-4">{email}</span>.
                  </p>
                </div>
                <div className="pt-4 text-center">
                    <Button 
                        variant="ghost"
                        onClick={() => setIsSubmitted(false)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-600/5 px-6 h-10 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all"
                    >
                        Resend Instructions
                    </Button>
                </div>
              </div>
            )}

            <div className="pt-8 text-center border-t border-border/50">
                <p className="mt-2 text-[9px] font-bold text-[#888888] uppercase tracking-[0.2em] opacity-60">
                   &copy; {new Date().getFullYear()} SchoolSaaS INFRASTRUCTURE
                </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
