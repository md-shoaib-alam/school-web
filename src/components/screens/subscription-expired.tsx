"use client";

import React from "react";
import { Crown, AlertCircle, Lock, CreditCard, Mail, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubscriptionExpiredProps {
  tenantName: string;
  tenantSlug: string;
  role: string;
  endDate?: string | null;
  status?: string;
}

export function SubscriptionExpiredScreen({ tenantName, tenantSlug, role, endDate, status }: SubscriptionExpiredProps) {
  const router = useRouter();
  const isAdmin = role === "admin";
  const isSuspended = status === "suspended";

  const dateStr = endDate ? new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "N/A";

  // UI Constants conditioned on status
  const title = isSuspended ? "Account Suspended" : "Subscription Expired";
  const icon = isSuspended ? <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" /> : <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />;
  const bannerColor = isSuspended ? "bg-red-50 dark:bg-red-950/30" : "bg-amber-50 dark:bg-amber-950/30";
  const circleColor = isSuspended ? "bg-red-100 dark:bg-red-900/50" : "bg-amber-100 dark:bg-amber-900/50";
  const indicatorIcon = isSuspended ? <ShieldAlert className="w-6 h-6 text-red-500" /> : <AlertCircle className="w-6 h-6 text-amber-500" />;
  
  const subHeading = isSuspended 
    ? "This school account is currently locked." 
    : `Expired on ${dateStr}`;
    
  const bodyText = isSuspended 
    ? `Access to ${tenantName} has been administratively suspended.`
    : `Access to ${tenantName} has been temporarily paused due to plan expiry.`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        
        {/* Header visual */}
        <div className={`${bannerColor} p-8 text-center relative transition-colors`}>
          <div className="absolute top-4 right-4">
            {indicatorIcon}
          </div>
          <div className={`mx-auto w-20 h-20 ${circleColor} rounded-full flex items-center justify-center mb-4 transition-colors`}>
            {icon}
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className={`${isSuspended ? "text-red-700 dark:text-red-400" : "text-amber-700 dark:text-amber-400"} text-sm font-medium mt-1`}>
            {subHeading}
          </p>
        </div>

        <div className="p-8">
          <div className="text-center space-y-4 mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {isSuspended ? (
                <>Access to <span className="font-semibold text-gray-900 dark:text-white">{tenantName}</span> has been administratively suspended.</>
              ) : (
                <>Access to <span className="font-semibold text-gray-900 dark:text-white">{tenantName}</span> has been temporarily paused due to plan expiry.</>
              )}
            </p>
            {isAdmin ? (
              <p className="text-sm text-gray-500">
                {isSuspended 
                  ? "Please contact platform support to resolve suspension issues and restore full functionality."
                  : "Please renew or upgrade your subscription to restore full functionality for all students, teachers, and staff immediately."}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Please reach out to your school administration to inquire about the platform access.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {isSuspended ? (
              // When suspended, prompt to mail/contact support instead of direct pay flow
              <a
                href="mailto:support@schoolsaas.com" 
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </a>
            ) : isAdmin ? (
              <button 
                onClick={() => router.push(`/${tenantSlug}/school-subscription`)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md group transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Renew Subscription
              </button>
            ) : (
              <button 
                disabled
                className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-3 px-4 rounded-xl cursor-not-allowed"
              >
                <Mail className="w-5 h-5" />
                Contact School Administrator
              </button>
            )}
            
            <button 
              onClick={() => router.push("/")}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
