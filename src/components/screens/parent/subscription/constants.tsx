import React from "react";
import { BookOpen, Star, Crown } from "lucide-react";
import { Plan } from "./types";

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential access to track your child's progress",
    icon: <BookOpen className="h-6 w-6" />,
    pricing: {
      monthly: { price: 0 },
      quarterly: { price: 0 },
      yearly: { price: 0 },
    },
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
    description: "Complete visibility into your child's academics",
    badge: "Most Popular",
    badgeColor: "bg-amber-500",
    popular: true,
    icon: <Star className="h-6 w-6" />,
    pricing: {
      monthly: { price: 11, originalPrice: 19 },
      quarterly: { price: 29, originalPrice: 37 },
      yearly: { price: 99, originalPrice: 199 },
    },
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
    description: "The ultimate parental engagement experience",
    badge: "Best Value",
    badgeColor: "bg-emerald-500",
    icon: <Crown className="h-6 w-6" />,
    pricing: {
      monthly: { price: 29, originalPrice: 49 },
      quarterly: { price: 79, originalPrice: 102 },
      yearly: { price: 249, originalPrice: 499 },
    },
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

export const PRICE_LOOKUP: Record<string, Record<string, number>> = {
  monthly: {
    basic: 0,
    standard: 11,
    premium: 29,
  },
  quarterly: {
    basic: 0,
    standard: 29,
    premium: 79,
  },
  yearly: {
    basic: 0,
    standard: 99,
    premium: 249,
  },
};

