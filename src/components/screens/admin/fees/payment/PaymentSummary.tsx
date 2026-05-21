"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, FileText, Building2, Smartphone, Sparkles } from "lucide-react";

interface PaymentSummaryProps {
  totalAmount: number;
  concessionTotal: number;
  payable: number;
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  onPay: () => void;
  paying: boolean;
}

export function PaymentSummary({
  totalAmount,
  concessionTotal,
  payable,
  paymentMethod,
  setPaymentMethod,
  onPay,
  paying,
}: PaymentSummaryProps) {
  return (
    <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="size-5 text-emerald-600" />
          Payment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Fees</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          {concessionTotal > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>Concession</span>
              <span>-₹{concessionTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Payable</span>
            <span className="text-emerald-600 dark:text-emerald-400">₹{payable.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'cash', icon: <Banknote className="size-5" />, label: 'Cash' },
              { id: 'cheque', icon: <FileText className="size-5" />, label: 'Cheque' },
              { id: 'online', icon: <Building2 className="size-5" />, label: 'Online' },
              { id: 'upi', icon: <Smartphone className="size-5" />, label: 'UPI' },
              { id: 'card', icon: <CreditCard className="size-5" />, label: 'Card' },
            ].map(m => (
              <button
                key={m.id}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-xs ${paymentMethod === m.id ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'border-transparent bg-muted/50 hover:bg-muted text-muted-foreground'}`}
                onClick={() => setPaymentMethod(m.id)}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-base" onClick={onPay} disabled={paying}>
          {paying ? (
            <><span className="animate-spin mr-2">⏳</span>Processing...</>
          ) : (
            <>
              <Sparkles className="size-5 mr-2" />
              Pay ₹{payable.toLocaleString()} via {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
