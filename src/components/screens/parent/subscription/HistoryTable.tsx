"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SubscriptionRecord } from "./types";

interface HistoryTableProps {
  subscriptions: SubscriptionRecord[];
  slug?: string;
}

const fmtDate = (v?: string | null) => {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function HistoryTable({ subscriptions, slug: propSlug }: HistoryTableProps) {
  const params = useParams();
  const slug = propSlug || (params?.slug as string) || "demo-academy";
  const [showAllInvoices, setShowAllInvoices] = useState(false);

  if (subscriptions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No invoices yet. They appear here after each payment.
      </p>
    );
  }

  const visibleInvoices = showAllInvoices ? subscriptions : subscriptions.slice(0, 3);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Date</th>
              <th className="py-2 pr-4 font-medium">Plan</th>
              <th className="py-2 pr-4 font-medium">Amount</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody>
            {visibleInvoices.map((inv) => (
              <tr key={inv.id} className="border-t border-border">
                <td className="py-3 pr-4 tabular-nums" suppressHydrationWarning>
                  {fmtDate(inv.createdAt)}
                </td>
                <td className="py-3 pr-4">{inv.planName}</td>
                <td className="py-3 pr-4 tabular-nums">
                  {inv.amount === 0 ? "Free" : `₹${Number(inv.amount).toLocaleString("en-IN")}`}
                </td>
                <td className="py-3 pr-4 capitalize text-muted-foreground">{inv.status}</td>
                <td className="py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="h-7 px-2.5">
                    <a
                      href={`/invoice/${slug}/${inv.transactionId || inv.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View invoice
                    </a>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {subscriptions.length > 3 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => setShowAllInvoices((v) => !v)}
        >
          {showAllInvoices ? "Show less" : "See more"}
        </Button>
      )}
    </>
  );
}
