import React from "react";
import { BookOpen, Star, Crown, Zap, Gift } from "lucide-react";
import { Plan, Addon } from "./types";

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "Forever Free",
    description: "Essential access to track your child's progress",
    icon: <BookOpen className="h-6 w-6" />,
    features: [
      { text: "View child's grades & reports", included: true },
      { text: "Basic attendance overview", included: true },
      { text: "View school notices", included: true },
      { text: "Fee payment status", included: true },
      { text: "Detailed performance analytics", included: false },
      { text: "Real-time notifications", included: false },
      { text: "Parent-teacher chat", included: false },
      { text: "Monthly progress reports", included: false },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 299,
    originalPrice: 499,
    period: "per year",
    description: "Complete visibility into your child's academics",
    badge: "Most Popular",
    badgeColor: "bg-amber-500",
    popular: true,
    icon: <Star className="h-6 w-6" />,
    features: [
      { text: "View child's grades & reports", included: true },
      { text: "Detailed attendance with trends", included: true },
      { text: "View school notices", included: true },
      { text: "Online fee payment", included: true },
      { text: "Detailed performance analytics", included: true },
      { text: "Real-time notifications", included: true },
      { text: "Parent-teacher chat", included: false },
      { text: "Monthly progress reports (PDF)", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 599,
    originalPrice: 999,
    period: "per year",
    description: "The ultimate parental engagement experience",
    badge: "Best Value",
    badgeColor: "bg-emerald-500",
    icon: <Crown className="h-6 w-6" />,
    features: [
      { text: "View child's grades & reports", included: true },
      { text: "Detailed attendance with AI insights", included: true },
      { text: "Priority notices & alerts", included: true },
      { text: "Online fee payment with discounts", included: true },
      { text: "AI-powered performance analytics", included: true },
      { text: "Instant push notifications", included: true },
      { text: "Direct parent-teacher chat", included: true },
      { text: "Monthly progress reports (PDF + email)", included: true },
    ],
  },
];

export const ADDONS: Addon[] = [
  {
    id: "transport",
    name: "Live Bus Tracking",
    price: 99,
    period: "per year",
    description: "Track school bus in real-time",
    icon: <Zap className="h-5 w-5" />,
    features: [
      "Real-time GPS tracking",
      "ETA notifications",
      "Geofence alerts",
    ],
  },
  {
    id: "meals",
    name: "Meal Plan",
    price: 149,
    period: "per month",
    description: "Healthy meals for your child",
    icon: <Gift className="h-5 w-5" />,
    features: [
      "Daily lunch included",
      "Nutritional reports",
      "Special diet options",
    ],
  },
];
