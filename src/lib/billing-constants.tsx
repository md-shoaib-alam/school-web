import React from "react";
import { Zap, Shield, Crown, Building2, BookOpen, Star } from "lucide-react";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface ResourceLimits {
  students: number;
  teachers: number;
  parents: number;
  classes: number;
}

export interface PricingInfo {
  price: number;
  originalPrice?: number;
}

export interface BillingTier {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: (string | PlanFeature)[];
  popular?: boolean;
  badge?: string;
  badgeColor?: string;
}

export interface SchoolPlan extends BillingTier {
  price: number;
  limits: ResourceLimits;
}

export interface ParentPlan extends BillingTier {
  pricing: {
    monthly: PricingInfo;
    quarterly: PricingInfo;
    yearly: PricingInfo;
  };
}

// --- SCHOOL PLANS (B2B) ---

export const SCHOOL_PLANS: SchoolPlan[] = [
  {
    id: "basic",
    name: "Starter",
    description: "Ideal for small preschools and private tutoring centers.",
    price: 499,
    icon: <Zap className="h-6 w-6" />,
    color: "indigo",
    limits: {
      students: 100,
      teachers: 20,
      parents: 100,
      classes: 10,
    },
    features: [
      "Student & Staff Attendance",
      "Basic Fee Management",
      "Digital Notice Board",
      "Mobile App Access",
      "Standard Support",
    ],
  },
  {
    id: "standard",
    name: "Growth",
    description: "Perfect for established schools looking to digitize operations.",
    price: 1499,
    icon: <Shield className="h-6 w-6" />,
    color: "emerald",
    popular: true,
    limits: {
      students: 500,
      teachers: 50,
      parents: 500,
      classes: 30,
    },
    features: [
      "Everything in Starter",
      "Advanced Exam Reports",
      "Online Fee Collection",
      "Library Management",
      "Priority Email Support",
      "Custom ID Cards",
    ],
  },
  {
    id: "premium",
    name: "Institution",
    description: "The complete solution for large-scale educational institutions.",
    price: 3999,
    icon: <Crown className="h-6 w-6" />,
    color: "amber",
    limits: {
      students: 2000,
      teachers: 150,
      parents: 2000,
      classes: 100,
    },
    features: [
      "Everything in Growth",
      "AI Performance Insights",
      "Transport Tracking",
      "Inventory Management",
      "Account Manager",
      "White-label Branding",
    ],
  },
];

// --- PARENT PLANS (B2C) ---

export const PARENT_PLANS: ParentPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Essential access to track your child's progress",
    icon: <BookOpen className="h-6 w-6" />,
    color: "blue",
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
    color: "amber",
    pricing: {
      monthly: { price: 11, originalPrice: 19 },
      quarterly: { price: 29, originalPrice: 37 },
      yearly: { price: 99, originalPrice: 199 },
    },
    features: [
      { text: "Detailed attendance with trends", included: true },
      { text: "Online fee payment", included: true },
      { text: "Detailed performance analytics", included: true },
      { text: "Real-time notifications", included: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "The ultimate parental engagement experience",
    badge: "Best Value",
    badgeColor: "bg-emerald-500",
    icon: <Crown className="h-6 w-6" />,
    color: "emerald",
    pricing: {
      monthly: { price: 29, originalPrice: 49 },
      quarterly: { price: 79, originalPrice: 102 },
      yearly: { price: 249, originalPrice: 499 },
    },
    features: [
      { text: "AI-powered performance analytics", included: true },
      { text: "Instant push notifications", included: true },
      { text: "Direct parent-teacher chat", included: true },
      { text: "Monthly progress reports (PDF + email)", included: true },
    ],
  },
];
