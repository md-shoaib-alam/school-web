"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  className: string;
  [key: string]: any;
}

interface ChildSelectorProps {
  students: Student[];
  selectedStudentId: string;
  onSelect: (id: string) => void;
}

export function ChildSelector({ students, selectedStudentId, onSelect }: ChildSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  if (students.length <= 1 || !selectedStudent) return null;

  const initials = selectedStudent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative z-20 select-none text-left w-fit">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors shadow-xs group w-fit cursor-pointer"
      >
        <div className="relative">
          <span className="size-7 sm:size-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 border border-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[10px] sm:text-xs font-semibold shadow-xs">
            {initials}
          </span>
          <div className="absolute -bottom-0.5 -right-0.5 size-2.5 sm:size-3 bg-emerald-500 border-2 border-card rounded-full" />
        </div>
        
        <div className="text-left space-y-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-semibold text-foreground block truncate max-w-[140px] sm:max-w-none">
              {selectedStudent.name}
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-semibold tracking-wide shrink-0">
              Active
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{selectedStudent.className}</span>
        </div>

        {students.length > 1 && (
          <ChevronDown className={cn("size-3.5 sm:size-4 text-muted-foreground ml-auto sm:ml-2 transition-transform duration-200", dropdownOpen && "rotate-180")} />
        )}
      </button>

      {dropdownOpen && students.length > 1 && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute left-0 right-0 sm:right-auto top-full mt-2 sm:w-72 z-30 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
              Switch Student
            </div>
            <div className="max-h-[280px] sm:max-h-[320px] overflow-y-auto custom-scrollbar">
              {students.map((student) => {
                const isSelected = student.id === selectedStudent.id;
                const studentInitials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <button
                    key={student.id}
                    onClick={() => {
                      onSelect(student.id);
                      setDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer",
                      isSelected 
                        ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "size-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors",
                        isSelected 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "bg-muted text-foreground border border-border"
                      )}>
                        {studentInitials}
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-xs sm:text-sm font-semibold text-foreground block">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{student.className}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1.5">
                         <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Selected</span>
                         <Check className="size-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
