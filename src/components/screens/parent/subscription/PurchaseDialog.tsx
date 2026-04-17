"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { Plan } from "./types";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan | null;
  processing: boolean;
  onConfirm: () => void;
  userName?: string;
}

export function PurchaseDialog({
  open,
  onOpenChange,
  plan,
  processing,
  onConfirm,
  userName,
}: PurchaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            Confirm Purchase
          </DialogTitle>
          <DialogDescription>
            You are about to subscribe to the {plan?.name} plan.
          </DialogDescription>
        </DialogHeader>

        {plan && (
          <div className="space-y-4 py-2">
            <Card className="border-gray-200 dark:border-gray-700 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {plan.name} Plan
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {plan.period}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {plan.price === 0
                        ? "Free"
                        : `₹${plan.price}`}
                    </p>
                    {plan.originalPrice && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                        ₹{plan.originalPrice}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                  Card Number
                </label>
                <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                  4242 •••• •••• 8888
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                    Expiry
                  </label>
                  <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                    12/27
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                    CVV
                  </label>
                  <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                    •••
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">
                  Cardholder Name
                </label>
                <div className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 flex items-center text-sm text-gray-400 dark:text-gray-500">
                  {userName || "Parent Name"}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/20"
            onClick={onConfirm}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₹${plan?.price}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
