"use client";

import React from "react";
import { Crown, AlertCircle, Lock, CreditCard, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubscriptionExpiredProps {
  tenantName: string;
  tenantSlug: string;
  role: string;
  endDate?: string | null;
}

export function SubscriptionExpiredScreen({ tenantName, tenantSlug, role, endDate }: SubscriptionExpiredProps) {
  const router = useRouter();
  const isAdmin = role === "admin";

  const dateStr = endDate ? new Date(endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "N/A";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        
        {/* Header visual */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-8 text-center relative">
          <div className="absolute top-4 right-4">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Expired</h2>
          <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mt-1">
            Expired on {dateStr}
          </p>
        </div>

        <div className="p-8">
          <div className="text-center space-y-4 mb-8">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Access to <span className="font-semibold text-gray-900 dark:text-white">{tenantName}</span> has been temporarily paused due to plan expiry.
            </p>
            {isAdmin ? (
              <p className="text-sm text-gray-500">
                Please renew or upgrade your subscription to restore full functionality for all students, teachers, and staff immediately.
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Please reach out to your school administration to reactivate the platform access.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {isAdmin ? (
              <button 
                onClick={() => router.push(`/${tenantSlug}/school-subscription`)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md group"
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
