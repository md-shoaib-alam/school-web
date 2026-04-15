"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/use-app-store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { StudentInfo, FeeRecord } from "@/lib/types";

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  paid: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    text: "Paid",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    text: "Pending",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  overdue: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    text: "Overdue",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

const typeIcons: Record<string, string> = {
  tuition: "📚",
  exam: "📝",
  library: "📖",
  transport: "🚌",
};

export function ParentFees() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [allFees, setAllFees] = useState<FeeRecord[]>([]);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const studentsRes = await apiFetch("/api/students");
        const studentsData = await studentsRes.json();

        const parentStudents = studentsData.filter(
          (s: StudentInfo) => s.parentName === currentUser?.name,
        );
        const studentIds = parentStudents.map((s: StudentInfo) => s.id);

        setStudents(parentStudents);
        if (parentStudents.length > 0) {
          setActiveTab(parentStudents[0].id);
          const feesRes = await fetch(
            `/api/fees?studentId=${parentStudents[0].id}`,
          );
          if (feesRes.ok) setAllFees(await feesRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser?.name]);

  useEffect(() => {
    if (!activeTab || loading) return;
    async function fetchFees() {
      try {
        const res = await apiFetch(`/api/fees?studentId=${activeTab}`);
        if (res.ok) setAllFees(await res.json());
      } catch (error) {
        console.error("Failed to fetch fees:", error);
      }
    }
    fetchFees();
  }, [activeTab, loading]);

  const allStudentIds = useMemo(() => students.map((s) => s.id), [students]);
  const [allChildrenFees, setAllChildrenFees] = useState<FeeRecord[]>([]);

  useEffect(() => {
    if (allStudentIds.length === 0) return;
    async function fetchAllFees() {
      try {
        const promises = allStudentIds.map((id) =>
          apiFetch(`/api/fees?studentId=${id}`),
        );
        const responses = await Promise.all(promises);
        const results = await Promise.all(
          responses.map((r) => (r.ok ? r.json() : [])),
        );
        setAllChildrenFees(results.flat() as FeeRecord[]);
      } catch {
        console.error("Failed to fetch all fees");
      }
    }
    fetchAllFees();
  }, [allStudentIds]);

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
    setAllFees((prev) =>
      prev.map((f) => {
        if (f.id === feeId) {
          return { ...f, status: "paid", paidAmount: f.amount };
        }
        return f;
      }),
    );
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Fee Management
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Fees</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  ${summary.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-emerald-200 dark:border-emerald-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid Amount</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${summary.paid.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-amber-200 dark:border-amber-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  ${summary.pending.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  ${summary.overdue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Child filter tabs */}
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
          const currentFees = allFees;

          return (
            <TabsContent key={student.id} value={student.id} className="mt-6">
              <Card className="rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    Fee Details — {student.name}
                  </CardTitle>
                  <CardDescription>
                    {currentFees.length} fee records
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fee Type</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Amount
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Due Date
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Paid Amount
                          </TableHead>
                          <TableHead className="w-28 text-center">
                            Status
                          </TableHead>
                          <TableHead className="w-24 text-center">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentFees.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center py-12 text-muted-foreground"
                            >
                              <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
                              <p>No fee records found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentFees.map((fee) => {
                            const config =
                              statusConfig[fee.status] || statusConfig.pending;
                            return (
                              <TableRow
                                key={fee.id}
                                className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors"
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {typeIcons[fee.type] || "💰"}
                                    </span>
                                    <span className="font-medium text-sm capitalize">
                                      {fee.type}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-sm font-medium">
                                  ${fee.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                  {new Date(fee.dueDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-sm">
                                  <span
                                    className={
                                      fee.paidAmount > 0
                                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    ${fee.paidAmount.toLocaleString()}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    variant="outline"
                                    className={`${config.bg} font-medium capitalize`}
                                  >
                                    {config.icon}
                                    <span className="ml-1">{fee.status}</span>
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {fee.status !== "paid" ? (
                                    <Button
                                      size="sm"
                                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3"
                                      onClick={() => handlePayNow(fee.id)}
                                    >
                                      Pay Now
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                      ✓ Done
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function FeesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
