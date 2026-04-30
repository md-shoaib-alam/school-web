import React from "react";

export interface Plan {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  pricing: {
    monthly: { price: number; originalPrice?: number };
    quarterly: { price: number; originalPrice?: number };
    yearly: { price: number; originalPrice?: number };
  };
  features: { text: string; included: boolean }[];
}


export interface SubscriptionRecord {
  id: string;
  planName: string;
  planId: string;
  amount: number;
  period: string;
  status: string;
  transactionId: string | null;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  addons: string;
  createdAt: string;
}
