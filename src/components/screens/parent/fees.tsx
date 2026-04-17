"use client";

import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
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
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [allChildrenFees, setAllChildrenFees] = useState<FeeRecord[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const studentsRes = await apiFetch("/api/students");
        const studentsData = await studentsRes.json();

        const parentStudents = studentsData.filter(
          (s: StudentInfo) => s.parentName === currentUser?.name,
        );
        setStudents(parentStudents);

        if (parentStudents.length > 0) {
          setActiveTab(parentStudents[0].id);
          const studentIds = parentStudents.map((s: StudentInfo) => s.id);
          
          const promises = studentIds.map((id) => apiFetch(`/api/fees?studentId=${id}`));
          const responses = await Promise.all(promises);
          const results = await Promise.all(responses.map((r) => (r.ok ? r.json() : [])));
          setAllChildrenFees(results.flat() as FeeRecord[]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser?.name]);

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

  const handlePayNow = (feeId: string) => {
    setAllChildrenFees((prev) =>
      prev.map((f) => {
        if (f.id === feeId) {
          return { ...f, status: "paid", paidAmount: f.amount };
        }
        return f;
      }),
    );
    toast.success("Payment recorded successfully!");
  };

  if (loading) return <FeesSkeleton />;

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
