"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/use-app-store";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, ArrowRight, CheckCircle2, AlertCircle, Loader2, Users, AlertTriangle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClasses } from "@/lib/graphql/hooks";
import type { ClassInfo } from "@/lib/types";

export function AdminPromotions() {
  const { currentTenantId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ];

  const [fromClassId, setFromClassId] = useState<string>("");
  const [toClassId, setToClassId] = useState<string>("");
  const [targetYear, setTargetYear] = useState<string>(yearOptions[1]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Queries
  const { data: classData, isLoading: classesLoading } = useClasses(currentTenantId || undefined);
  const classes = (classData?.classes || []) as ClassInfo[];

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", "promotion", fromClassId],
    queryFn: () => api.get(`/students?classId=${fromClassId}`),
    enabled: !!fromClassId,
  });

  const promotionMutation = useMutation({
    mutationFn: (data: {
      sourceClassId: string;
      targetClassId: string;
      studentIds: string[];
      targetYear: string;
    }) => api.post("/promotions", data),
    onSuccess: (res: any) => {
      toast({
        title: "Success",
        description: `Promoted ${res.promoted || selectedStudents.length} students to ${targetYear}.`,
      });
      setSelectedStudents([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setFromClassId("");
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Promotion failed.",
        variant: "destructive",
      });
    },
  });

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handlePromote = () => {
    if (!fromClassId || !toClassId || selectedStudents.length === 0) return;
    promotionMutation.mutate({
      sourceClassId: fromClassId,
      targetClassId: toClassId,
      studentIds: selectedStudents,
      targetYear,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Class Promotions
                </h2>
                <p className="text-indigo-100 text-sm">
                  Manage seasonal student transitions securely and efficiently
                </p>
              </div>
            </div>
            {selectedStudents.length > 0 && (
              <Button
                onClick={handlePromote}
                disabled={promotionMutation.isPending}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm hidden sm:flex shadow-xl"
              >
                {promotionMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Promote {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Badge
              variant="outline"
              className="bg-white/10 text-white border-white/20 backdrop-blur-sm px-3 py-1 text-xs"
            >
              Active Session: {targetYear}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Configuration */}
        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-4 bg-violet-500 rounded-full" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-5 text-sm">
                <SelectField
                  label="Promote From"
                  value={fromClassId}
                  onValueChange={setFromClassId}
                  placeholder="Select source class..."
                  options={classes}
                  loading={classesLoading}
                />
                <div className="flex justify-center -my-3 relative z-10 origin-center">
                  <div className="bg-white dark:bg-gray-950 p-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm z-20">
                    <ArrowRight className="h-4 w-4 text-violet-500 rotate-90 lg:rotate-0" />
                  </div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-200 dark:bg-gray-800 -translate-x-1/2 -z-10" />
                </div>
                <SelectField
                  label="Promote To"
                  value={toClassId}
                  onValueChange={setToClassId}
                  placeholder="Select target class..."
                  options={classes}
                  loading={classesLoading}
                />
                <YearField
                  label="Target Academic Year"
                  value={targetYear}
                  onValueChange={setTargetYear}
                  options={yearOptions}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                  Important Notice
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  Promotion alters student enrollment records permanently. Double
                  check your target class and academic year before completing
                  these promotions.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Step 2: Selection */}
        <main className="lg:col-span-8 flex flex-col gap-4">
          <Card className="flex-1 overflow-hidden shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="space-y-1 block max-w-full">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                  Student Selection Roster
                </CardTitle>
                {fromClassId && (
                  <p className="text-xs text-muted-foreground ml-3.5">
                    Found {students.length} eligible students
                  </p>
                )}
              </div>
              <div className="mt-3 sm:mt-0 flex gap-2">
                {students.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-indigo-600 dark:text-indigo-400 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
                    onClick={() =>
                      setSelectedStudents(
                        selectedStudents.length === students.length
                          ? []
                          : students.map((s: any) => s.id),
                      )
                    }
                  >
                    {selectedStudents.length === students.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {studentsLoading ? (
                  <LoaderView />
                ) : !fromClassId ? (
                  <EmptyView
                    icon={<Users className="h-10 w-10 text-indigo-300" />}
                    title="Source Class Required"
                    desc="Please select a source class from the configuration panel to load its current student roster."
                  />
                ) : students.length === 0 ? (
                  <EmptyView
                    icon={<AlertCircle className="h-10 w-10 text-amber-300" />}
                    title="Empty Roster"
                    desc="This source class currently has no enrolled students."
                  />
                ) : (
                  <Table>
                    <TableHeader className="bg-white dark:bg-gray-950 sticky top-0 z-10 shadow-sm border-b">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="w-12 px-6"></TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground">
                          Student Information
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground px-8">
                          Current Enrollment
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student: any) => (
                        <TableRow
                          key={student.id}
                          className={cn(
                            "hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800/50",
                            selectedStudents.includes(student.id) &&
                              "bg-indigo-50/60 dark:bg-indigo-900/30",
                          )}
                          onClick={() => toggleStudent(student.id)}
                        >
                          <TableCell className="px-6">
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudent(student.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                                {student.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold">
                                  {student.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Roll No: {student.rollNumber}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex flex-col items-end gap-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0"
                              >
                                {student.className}
                              </Badge>
                              <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                                <CalendarDays className="h-3 w-3 opacity-70" />
                                {student.academicYear || "Current"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Mobile action bar sticky to bottom */}
      {selectedStudents.length > 0 && (
        <div className="sm:hidden fixed bottom-6 left-6 right-6">
          <Button
            onClick={handlePromote}
            disabled={promotionMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl h-12 rounded-xl text-base"
          >
            {promotionMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-5 w-5 mr-2" />
            )}
            Promote {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}

// Sub-components
function SelectField({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  loading = false,
}: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} disabled={loading}>
        <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 h-10 shadow-sm transition-colors focus:ring-indigo-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o: any) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name} - {o.section}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function YearField({ label, value, onValueChange, options }: any) {
  return (
    <div className="space-y-1.5 pt-2">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 h-10 shadow-sm transition-colors focus:ring-indigo-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((y: string) => (
            <SelectItem key={y} value={y}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function LoaderView() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 opacity-70">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Loading Roster...
      </p>
    </div>
  );
}

function EmptyView({ icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-4 px-6 py-12">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
