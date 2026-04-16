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
import { GraduationCap, ArrowRight, CheckCircle2, AlertCircle, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Unified Student Promotion Hub
 * A simplified, high-fidelity experience for academic transitions.
 */
export function AdminPromotions() {
  const { currentTenantId } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentYear = new Date().getFullYear();
  const yearOptions = [`${currentYear-1}-${currentYear}`, `${currentYear}-${currentYear+1}`, `${currentYear+1}-${currentYear+2}`];

  const [fromClassId, setFromClassId] = useState<string>("");
  const [toClassId, setToClassId] = useState<string>("");
  const [targetYear, setTargetYear] = useState<string>(yearOptions[1]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Queries
  const { data: classes = [] } = useQuery({
    queryKey: ["classes", currentTenantId],
    queryFn: () => api.get("/classes"),
    enabled: !!currentTenantId,
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students", "promotion", fromClassId],
    queryFn: () => api.get(`/students?classId=${fromClassId}`),
    enabled: !!fromClassId,
  });

  const promotionMutation = useMutation({
    mutationFn: (data: { sourceClassId: string; targetClassId: string; studentIds: string[]; targetYear: string }) =>
      api.post("/promotions", data),
    onSuccess: (res) => {
      toast({ title: "Success", description: `Promoted ${res.promoted} students to ${targetYear}.` });
      setSelectedStudents([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setFromClassId("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message || "Promotion failed.", variant: "destructive" });
    },
  });

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handlePromote = () => {
    if (!fromClassId || !toClassId || selectedStudents.length === 0) return;
    promotionMutation.mutate({ sourceClassId: fromClassId, targetClassId: toClassId, studentIds: selectedStudents, targetYear });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 dark:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <div className="p-2 bg-rose-500 rounded-lg text-white shadow-lg shadow-rose-500/20">
                <GraduationCap className="h-6 w-6" />
             </div>
             Class Promotion
          </h1>
          <p className="text-sm text-muted-foreground font-medium">Manage seasonal student transitions with precision and audit security.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-mono">
              Active Session: {targetYear}
           </Badge>
           {selectedStudents.length > 0 && (
             <Button 
               onClick={handlePromote}
               disabled={promotionMutation.isPending}
               className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-10 px-6 shadow-xl shadow-rose-500/10"
             >
               {promotionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
               Promote {selectedStudents.length} Students
             </Button>
           )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step 1: Configuration */}
        <aside className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
              <CardHeader className="pb-4">
                 <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <div className="w-1 h-4 bg-rose-500 rounded-full" />
                    1. Configuration
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid gap-4">
                    <SelectField label="From Class" value={fromClassId} onValueChange={setFromClassId} placeholder="Source..." options={classes} />
                    <div className="flex justify-center -my-2 relative z-10">
                       <div className="bg-white dark:bg-slate-950 p-1.5 rounded-full border shadow-sm">
                          <ArrowRight className="h-4 w-4 text-rose-500 rotate-90 lg:rotate-0" />
                       </div>
                    </div>
                    <SelectField label="To Class" value={toClassId} onValueChange={setToClassId} placeholder="Target..." options={classes} />
                    <YearField label="Promotion Year" value={targetYear} onValueChange={setTargetYear} options={yearOptions} />
                 </div>
              </CardContent>
           </Card>

           <div className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-900/10 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-400 uppercase leading-relaxed">
                 Double-check selection. Promotion changes student enrollment history permanently.
              </p>
           </div>
        </aside>

        {/* Step 2: Selection */}
        <main className="lg:col-span-8 flex flex-col gap-4">
           <Card className="flex-1 overflow-hidden border-slate-200 dark:border-slate-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4 bg-white dark:bg-slate-950">
                 <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                       <div className="w-1 h-4 bg-rose-500 rounded-full" />
                       2. Student Roster
                    </CardTitle>
                    {fromClassId && <p className="text-xs text-muted-foreground font-mono">Found {students.length} students</p>}
                 </div>
                 {students.length > 0 && (
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      onClick={() => setSelectedStudents(selectedStudents.length === students.length ? [] : students.map((s:any) => s.id))}
                   >
                      {selectedStudents.length === students.length ? 'Clear All' : 'Select All'}
                   </Button>
                 )}
              </CardHeader>
              <CardContent className="p-0">
                 <ScrollArea className="h-[500px]">
                    {studentsLoading ? (
                       <LoaderView />
                    ) : !fromClassId ? (
                       <EmptyView icon={<Users className="h-10 w-10" />} title="Class Required" desc="Select a source class to view the student list." />
                    ) : students.length === 0 ? (
                       <EmptyView icon={<AlertCircle className="h-10 w-10" />} title="No Students" desc="This class is currently empty." />
                    ) : (
                       <Table>
                          <TableHeader className="bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                             <TableRow className="border-none">
                                <TableHead className="w-12 px-6"></TableHead>
                                <TableHead className="text-[10px] font-bold uppercase">Student Information</TableHead>
                                <TableHead className="text-right text-[10px] font-bold uppercase px-8">Current State</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {students.map((student: any) => (
                                <TableRow 
                                   key={student.id} 
                                   className={cn(
                                     "hover:bg-rose-50/30 dark:hover:bg-rose-900/10 cursor-pointer transition-colors",
                                     selectedStudents.includes(student.id) && "bg-rose-50/50 dark:bg-rose-900/20"
                                   )}
                                   onClick={() => toggleStudent(student.id)}
                                >
                                   <TableCell className="px-6">
                                      <Checkbox 
                                        checked={selectedStudents.includes(student.id)} 
                                        onCheckedChange={() => toggleStudent(student.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                      />
                                   </TableCell>
                                   <TableCell>
                                      <div className="flex flex-col">
                                         <span className="text-sm font-bold">{student.name}</span>
                                         <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Roll: {student.rollNumber}</span>
                                      </div>
                                   </TableCell>
                                   <TableCell className="text-right px-8">
                                      <div className="flex flex-col items-end gap-1">
                                         <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{student.className}</span>
                                         <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 opacity-60">Year: {student.academicYear || 'Unset'}</span>
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
    </div>
  );
}

// Sub-components for a cleaner, manageable structure
function SelectField({ label, value, onValueChange, placeholder, options }: any) {
  return (
    <div className="space-y-1.5">
       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{label}</label>
       <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
             <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
             {options.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.name} - {o.section}</SelectItem>)}
          </SelectContent>
       </Select>
    </div>
  );
}

function YearField({ label, value, onValueChange, options }: any) {
  return (
    <div className="space-y-1.5">
       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{label}</label>
       <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-mono">
             <SelectValue />
          </SelectTrigger>
          <SelectContent>
             {options.map((y: string) => <SelectItem key={y} value={y} className="font-mono">{y}</SelectItem>)}
          </SelectContent>
       </Select>
    </div>
  );
}

function LoaderView() {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
       <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
       <p className="text-xs font-mono uppercase">fetching roster...</p>
    </div>
  );
}

function EmptyView({ icon, title, desc }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-24 text-center gap-4 text-slate-300 dark:text-slate-700">
       {icon}
       <div>
          <p className="text-lg font-bold text-slate-400 dark:text-slate-600">{title}</p>
          <p className="text-sm font-medium opacity-50 max-w-[180px] mx-auto">{desc}</p>
       </div>
    </div>
  );
}
