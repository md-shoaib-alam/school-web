"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UserCheck, Search, ChevronRight } from "lucide-react";
import type { StudentOption, ClassOption } from "../types";

interface StudentSelectorProps {
  classFilter: string;
  setClassFilter: (v: string) => void;
  studentSearch: string;
  setStudentSearch: (v: string) => void;
  classes: ClassOption[];
  filteredStudents: StudentOption[];
  onSelectStudent: (s: StudentOption) => void;
}

export function StudentSelector({
  classFilter,
  setClassFilter,
  studentSearch,
  setStudentSearch,
  classes,
  filteredStudents,
  onSelectStudent,
}: StudentSelectorProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="size-5 text-emerald-600" />
          Select Student
        </CardTitle>
        <CardDescription>Search and select a student to make a payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={classFilter} onValueChange={v => { setClassFilter(v); setStudentSearch(''); }}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone number..." 
              className="pl-9" 
              value={studentSearch} 
              onChange={e => setStudentSearch(e.target.value)} 
            />
          </div>
        </div>
        <div className="rounded-lg border divide-y">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="size-8 mx-auto mb-2 opacity-30" />
              <p>No students found</p>
            </div>
          ) : (
            filteredStudents.map(s => (
              <button 
                key={s.id} 
                type="button"
                className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors text-left" 
                onClick={() => onSelectStudent(s)}
              >
                <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold shrink-0">
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.className} • {s.phone || 'No phone'}</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
