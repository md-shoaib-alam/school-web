import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { useQueryClient } from "@tanstack/react-query";
import { useParentDashboard } from "@/lib/graphql/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import type { StudentInfo, FeeRecord } from "@/lib/types";

// Sub-components
import { FeeSummary } from "./fees/FeeSummary";
import { FeeTable } from "./fees/FeeTable";
import { FeesSkeleton } from "./fees/FeesSkeleton";

export function ParentFees() {
  const queryClient = useQueryClient();
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("");
  const [allChildrenFees, setAllChildrenFees] = useState<FeeRecord[]>([]);

  const { data, isPending } = useParentDashboard(currentUser?.name || "");
  const students = (data?.children || []) as unknown as StudentInfo[];

  useEffect(() => {
    if (students.length > 0 && !activeTab) {
      setActiveTab(students[0].id);
    }
  }, [students, activeTab]);

  useEffect(() => {
    async function fetchFees() {
      if (students.length === 0) return;
      try {
        const studentIds = students.map((s: StudentInfo) => s.id);
        const promises = studentIds.map((id) => apiFetch(`/api/fees?studentId=${id}`));
        const responses = await Promise.all(promises);
        const results = await Promise.all(responses.map(async (r) => {
          if (!r.ok) return [];
          const data = await r.json();
          return Array.isArray(data) ? data : (data.items || []);
        }));
        setAllChildrenFees(results.flat() as FeeRecord[]);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      }
    }
    fetchFees();
  }, [students.length]);

  const summary = useMemo(() => {
    const total = allChildrenFees.reduce((sum, f) => sum + f.amount, 0);
    const paid = allChildrenFees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + f.paidAmount, 0);
    const pending = allChildrenFees
      .filter((f) => f.status === "pending")
      .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    const overdue = allChildrenFees
      .filter((f) => f.status === "overdue")
      .reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
    return { total, paid, pending, overdue };
  }, [allChildrenFees]);

  const handlePayNow = async (feeId: string) => {
    const fee = allChildrenFees.find(f => f.id === feeId);
    if (!fee) return;

    try {
      const paymentPromise = (async () => {
        const res = await apiFetch("/api/fee-receipts", {
          method: "POST",
          body: JSON.stringify({
            studentId: fee.studentId,
            feeIds: [fee.id],
            totalAmount: fee.amount,
            paidAmount: fee.amount,
            concessionTotal: 0,
            paymentMethod: "online",
            feeAmounts: { [fee.id]: fee.amount }
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Payment failed");
        }

        // Invalidate dashboard and other related queries
        queryClient.invalidateQueries({ queryKey: ["parent", "dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["fees"] });

        // Update local state on success
        setAllChildrenFees((prev) =>
          prev.map((f) => (f.id === feeId ? { ...f, status: "paid", paidAmount: f.amount } : f))
        );
      })();

      toast.promise(paymentPromise, {
        loading: "Processing payment...",
        success: "Payment successful!",
        error: (err: any) => `Error: ${err.message}`,
      });
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  if (isPending) return <FeesSkeleton />;

  if (students.length === 0) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-12 text-center">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">
            No children found
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            No students are linked to your account.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-tight">
          Fee Management
        </h2>
      </div>

      <FeeSummary 
        total={summary.total}
        paid={summary.paid}
        pending={summary.pending}
        overdue={summary.overdue}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-amber-50 dark:bg-amber-900/30 p-1">
          {students.map((student) => (
            <TabsTrigger
              key={student.id}
              value={student.id}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm px-4"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {student.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {students.map((student) => {
          const studentFees = allChildrenFees.filter(f => f.studentId === student.id);
          
          return (
            <TabsContent key={student.id} value={student.id} className="mt-6 animate-in fade-in duration-300">
              <FeeTable 
                studentName={student.name}
                fees={studentFees}
                onPay={handlePayNow}
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
