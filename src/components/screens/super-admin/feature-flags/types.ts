import React from "react";
import { 
  Zap, 
  Eye, 
  EyeOff, 
  Rocket, 
  Blocks, 
  Star, 
  Edit, 
  ToggleRight, 
  Shield,
  Crown,
  Gem,
  FlaskConical
} from "lucide-react";

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetedPlans: string[];
  category: "core" | "premium" | "enterprise" | "beta";
  icon: React.ElementType;
}

export type Plan = "All" | "Basic" | "Standard+" | "Premium+" | "Enterprise";

export const initialFlags: FeatureFlag[] = [
  { id: "ai-grading", name: "AI-Powered Grading", description: "Automated essay and assignment grading using machine learning models with teacher review.", enabled: true, rolloutPercentage: 100, targetedPlans: ["Premium+"], category: "premium", icon: Zap },
  { id: "bus-tracking", name: "Live Bus Tracking", description: "Real-time GPS tracking of school buses with parent notifications for arrivals and delays.", enabled: true, rolloutPercentage: 100, targetedPlans: ["Standard+"], category: "core", icon: Eye },
  { id: "video-conferencing", name: "Video Conferencing", description: "Built-in video calling for virtual classes, parent-teacher meetings, and staff collaboration.", enabled: false, rolloutPercentage: 0, targetedPlans: ["All"], category: "beta", icon: EyeOff },
  { id: "advanced-analytics", name: "Advanced Analytics", description: "Deep-dive analytics dashboards with custom reports, cohort analysis, and predictive insights.", enabled: true, rolloutPercentage: 80, targetedPlans: ["Premium+"], category: "premium", icon: Rocket },
  { id: "multi-language", name: "Multi-Language Support", description: "Platform interface available in 12+ languages with automatic locale detection.", enabled: true, rolloutPercentage: 100, targetedPlans: ["All"], category: "core", icon: Blocks },
  { id: "parent-app", name: "Parent Mobile App", description: "Dedicated mobile app for parents with push notifications, fee payments, and real-time updates.", enabled: true, rolloutPercentage: 60, targetedPlans: ["Standard+"], category: "core", icon: Star },
  { id: "online-exam", name: "Online Exam System", description: "Conduct secure online exams with plagiarism detection, time limits, and auto-grading.", enabled: true, rolloutPercentage: 50, targetedPlans: ["Premium+"], category: "premium", icon: Edit },
  { id: "fee-reminder", name: "Fee Auto-Reminder", description: "Automated SMS, email, and push notification reminders for upcoming and overdue fee payments.", enabled: true, rolloutPercentage: 100, targetedPlans: ["All"], category: "core", icon: ToggleRight },
  { id: "custom-reports", name: "Custom Report Builder", description: "Drag-and-drop report builder for creating custom academic and administrative reports.", enabled: false, rolloutPercentage: 0, targetedPlans: ["Enterprise"], category: "enterprise", icon: Edit },
  { id: "api-access", name: "API Access", description: "Full REST API access with OAuth2 authentication for third-party integrations.", enabled: true, rolloutPercentage: 30, targetedPlans: ["Enterprise"], category: "enterprise", icon: Shield },
];

export const planBadgeColors: Record<string, string> = {
  All: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  Basic: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  "Standard+": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700",
  "Premium+": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700",
  Enterprise: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700",
};

export const categoryIcons: Record<string, React.ElementType> = {
  core: Blocks,
  premium: Crown,
  enterprise: Gem,
  beta: FlaskConical,
};

export const categoryColors: Record<string, string> = {
  core: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
  premium: "text-amber-600 bg-amber-50 dark:bg-amber-900/30",
  enterprise: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
  beta: "text-teal-600 bg-teal-50 dark:bg-teal-900/30",
};
