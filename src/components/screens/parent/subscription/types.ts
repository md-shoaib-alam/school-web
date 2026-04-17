import React from "react";

export interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  icon: React.ReactNode;
  features: { text: string; included: boolean }[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
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
