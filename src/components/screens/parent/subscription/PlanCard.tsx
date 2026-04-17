"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, CheckCircle2, ArrowRight } from "lucide-react";
import { Plan } from "./types";

interface PlanCardProps {
  plan: Plan;
  isActive: boolean;
  onPurchase: (plan: Plan) => void;
}

export function PlanCard({ plan, isActive, onPurchase }: PlanCardProps) {
  const isPopular = plan.popular;

  return (
    <Card
      className={`relative rounded-2xl transition-all duration-300 hover:shadow-lg ${
        isPopular
          ? "border-amber-300 dark:border-amber-800 shadow-md ring-2 ring-amber-100 dark:ring-amber-900/30"
          : isActive
            ? "border-emerald-300 dark:border-emerald-800 shadow-md ring-2 ring-emerald-100 dark:ring-emerald-900/30"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${plan.badgeColor}`}
          >
            {plan.badge}
          </span>
        </div>
      )}

      <CardHeader className={`pt-8 ${isPopular ? "pb-2" : ""}`}>
        <div className="flex items-center justify-between">
          <div
            className={`h-12 w-12 rounded-xl flex items-center justify-center ${
              isPopular
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                : isActive
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {plan.icon}
          </div>
          {isActive && (
            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs border-emerald-200 dark:border-emerald-800 shadow-none">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <CardDescription className="mt-1">
            {plan.description}
          </CardDescription>
        </div>
        <div className="mt-4 flex items-baseline gap-1">
          {plan.price === 0 ? (
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Free
            </span>
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                ₹{plan.price}
              </span>
              {plan.originalPrice && (
                <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                  ₹{plan.originalPrice}
                </span>
              )}
            </>
          )}
          {plan.period !== "Forever Free" && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              / {plan.period}
            </span>
          )}
        </div>
        {plan.originalPrice && (
          <Badge className="mt-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 text-xs shadow-none">
            Save{" "}
            {Math.round(
              ((plan.originalPrice - plan.price) / plan.originalPrice) *
                100,
            )}
            %
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <Button
          className={`w-full h-11 text-sm font-semibold rounded-xl mt-2 ${
            isActive
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
              : isPopular
                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                : "bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900"
          }`}
          onClick={() => (isActive ? null : onPurchase(plan))}
          disabled={isActive}
        >
          {isActive ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Current Plan
            </>
          ) : plan.price === 0 ? (
            "Switch to Free"
          ) : (
            <>
              Get {plan.name} <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>

        <Separator className="my-5" />

        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            What&apos;s included
          </p>
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              {feature.included ? (
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">✕</span>
                </div>
              )}
              <span
                className={`text-sm ${feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
