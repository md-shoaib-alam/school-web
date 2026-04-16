"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/store/use-app-store";
import { goeyToast as toast } from "goey-toast";
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Users, 
  CalendarDays,
  Search,
  School,
  Save,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClassInfo, StudentInfo } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export function AdminPromotions() {
  const { currentTenantId } = useAppStore();
  // removed useToast hook line

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
  const [searchQuery, setSearchQuery] = useState("");

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load classes on mount
  const fetchClasses = useCallback(async () => {
    try {
      setClassesLoading(true);
      const res = await apiFetch("/api/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const json = await res.json();
      setClasses(json);
    } catch (err) {
      console.error("Error fetching classes:", err);
    } finally {
      setClassesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Load students when fromClassId changes - INSTANT FETCH
  const fetchStudentsForClass = useCallback(async (classId: string) => {
    if (!classId) {
      setStudents([]);
      return;
    }
    try {
      setStudentsLoading(true);
      // Direct API call to bypass any TanStack caching issues
      const res = await apiFetch(`/api/students?classId=${classId}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const json = await res.json();
      setStudents(json);
      setSelectedStudents([]); // Reset selection when class changes
    } catch (err) {
      console.error("Error fetching students:", err);
      toast.error("Error", {
        description: "Failed to load students for the selected class."
      });
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // Trigger fetch when fromClassId changes
  useEffect(() => {
    if (fromClassId) {
       fetchStudentsForClass(fromClassId);
    } else {
       setStudents([]);
    }
  }, [fromClassId, fetchStudentsForClass]);
  const handlePromote = async () => {
    if (!fromClassId || !toClassId || selectedStudents.length === 0) return;

    toast.promise(
      (async () => {
        const res = await apiFetch("/api/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceClassId: fromClassId,
            targetClassId: toClassId,
            studentIds: selectedStudents,
            targetYear,
          })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Promotion failed");
        }

        const data = await res.json();
        setSelectedStudents([]);
        setFromClassId(""); // Reset to force clear view
        setStudents([]);
        return `Successfully promoted ${data.promoted || selectedStudents.length} students`;
      })(),
      {
        loading: "Processing student promotions...",
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const markAll = () => {
    if (selectedStudents.length === students.length && students.length > 0) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s: any) => s.id));
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s: any) => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [students, searchQuery]);

  const getInitials = (name: string) => {
    return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Student Promotions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Transition students to the next class and academic session.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={targetYear} onValueChange={setTargetYear}>
            <SelectTrigger className="rounded-xl w-full sm:w-[180px] bg-white dark:bg-gray-950">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Eligible", val: students.length, color: "blue", icon: Users },
          { label: "Selected", val: selectedStudents.length, color: "emerald", icon: CheckCircle2 },
          { label: "Remaining", val: Math.max(0, students.length - selectedStudents.length), color: "gray", icon: GraduationCap },
          { label: "Target Year", val: targetYear, color: "amber", icon: CalendarDays },
        ].map((item, i) => (
          <Card key={i} className="rounded-xl shadow-sm border-0 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                item.color === "blue" && "bg-blue-50 dark:bg-blue-900/30",
                item.color === "emerald" && "bg-emerald-50 dark:bg-emerald-900/30",
                item.color === "gray" && "bg-gray-50 dark:bg-gray-800/30",
                item.color === "amber" && "bg-amber-50 dark:bg-amber-900/30"
              )}>
                <item.icon className={cn(
                  "h-5 w-5",
                  item.color === "blue" && "text-blue-500",
                  item.color === "emerald" && "text-emerald-500",
                  item.color === "gray" && "text-gray-500",
                  item.color === "amber" && "text-amber-500"
                )} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{item.label}</p>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                   {studentsLoading ? <Skeleton className="h-6 w-8 mt-1" /> : item.val}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
           <Card className="rounded-xl shadow-sm border-0 bg-white dark:bg-gray-900">
             <CardHeader className="pb-3 px-6">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                   <School className="h-4 w-4 text-blue-500" />
                   Configuration
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                   <label className="text-xs font-medium text-gray-500 ml-1">Promote From</label>
                   <Select value={fromClassId} onValueChange={setFromClassId}>
                      <SelectTrigger className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 border-gray-100 dark:border-gray-800">
                        <SelectValue placeholder="Select Source..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>

                <div className="flex justify-center -my-2 py-2">
                   <div className="bg-gray-50 dark:bg-gray-950 p-1.5 rounded-full border border-gray-100 dark:border-gray-800">
                      <ArrowRight className="h-3.5 w-3.5 text-blue-500 rotate-90 lg:rotate-0" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-medium text-gray-500 ml-1">Promote To</label>
                   <Select value={toClassId} onValueChange={setToClassId}>
                      <SelectTrigger className="rounded-xl bg-gray-50/50 dark:bg-gray-950/50 border-gray-100 dark:border-gray-800">
                        <SelectValue placeholder="Select Target..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name} - {c.section}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 flex gap-3">
                   <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                      Student enrollment will be updated permanently to the new class and academic year.
                   </p>
                </div>

                <Button
                   onClick={handlePromote}
                   disabled={submitting || selectedStudents.length === 0 || !toClassId}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 shadow-lg shadow-blue-500/20 font-bold gap-2 mt-2"
                >
                   {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                   Promote {selectedStudents.length || ''} Students
                </Button>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-8">
           <Card className="rounded-xl shadow-sm border-0 bg-white dark:bg-gray-900">
              <CardHeader className="pb-3 px-6">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                       <GraduationCap className="h-4 w-4 text-blue-500" />
                       Student Roster
                       <Badge variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {filteredStudents.length} total
                       </Badge>
                    </CardTitle>
                    <Button
                       variant="outline"
                       size="sm"
                       onClick={markAll}
                       className="text-xs h-7 border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg"
                    >
                       {selectedStudents.length === students.length && students.length > 0 ? "Deselect All" : "Select All Students"}
                    </Button>
                 </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4">
                 <div className="relative group max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                       placeholder="Search by name or roll..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="pl-9 h-9 border-gray-100 dark:border-gray-800 rounded-xl"
                    />
                 </div>

                 <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-2">
                       {studentsLoading ? (
                          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)
                       ) : !fromClassId ? (
                          <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-950/50 rounded-xl border border-dashed border-gray-100 dark:border-gray-800">
                             <p className="text-gray-400 text-sm font-medium">Select a source class to view students.</p>
                          </div>
                       ) : filteredStudents.length === 0 ? (
                          <div className="text-center py-20">
                             <p className="text-gray-400 text-sm font-medium">No students found in this class.</p>
                          </div>
                       ) : (
                          filteredStudents.map((s: any) => {
                             const isSelected = selectedStudents.includes(s.id);
                             return (
                                <div 
                                   key={s.id} 
                                   onClick={() => toggleStudent(s.id)}
                                   className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                                      isSelected 
                                        ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800" 
                                        : "bg-white dark:bg-gray-950 border-gray-50 dark:border-gray-900 hover:border-gray-100 dark:hover:border-gray-800"
                                   )}
                                >
                                   <Checkbox 
                                      checked={isSelected} 
                                      onCheckedChange={() => toggleStudent(s.id)}
                                      className="rounded-md border-gray-200 dark:border-gray-800 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                   />
                                   <Avatar className="h-8 w-8 flex-shrink-0">
                                      <AvatarFallback className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">
                                         {getInitials(s.name)}
                                      </AvatarFallback>
                                   </Avatar>
                                   <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate capitalize">{s.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Roll: {s.rollNumber || 'N/A'}</p>
                                   </div>
                                   <Badge variant="outline" className="text-[10px] bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-500 px-2 font-bold">
                                      {s.className}
                                   </Badge>
                                </div>
                             )
                          })
                       )}
                    </div>
                 </ScrollArea>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
