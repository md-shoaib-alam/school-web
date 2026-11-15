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

  if (students.length === 0 || !selectedStudent) return null;

  const initials = selectedStudent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative z-20 select-none text-left w-fit">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-[24px] border-2 border-amber-500/20 bg-card text-foreground hover:bg-amber-50/50 dark:hover:bg-amber-950/10 hover:border-amber-500/40 transition-all duration-300 shadow-sm group w-fit"
      >
        <div className="relative">
          <span className="size-7 sm:size-10 rounded-lg sm:rounded-xl bg-amber-400 text-foreground flex items-center justify-center text-[9px] sm:text-sm font-bold shadow-sm transition-transform group-hover:scale-105 group-hover:rotate-3">
            {initials}
          </span>
          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 size-3 sm:size-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        
        <div className="text-left space-y-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[12px] sm:text-sm font-semibold text-foreground block truncate max-w-[140px] sm:max-w-none">{selectedStudent.name}</span>
            <span className="hidden sm:inline-block text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border border-amber-500/20 shrink-0">
              Active
            </span>
          </div>
          <span className="text-[9px] sm:text-xs text-muted-foreground font-bold">{selectedStudent.className}</span>
        </div>

        {students.length > 1 && (
          <ChevronDown className={cn("size-3.5 sm:size-4 text-muted-foreground ml-auto sm:ml-2 transition-transform duration-300", dropdownOpen && "rotate-180")} />
        )}
      </button>

      {dropdownOpen && students.length > 1 && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute left-0 right-0 sm:right-auto top-full mt-2 sm:mt-3 sm:w-72 z-20 bg-card border  rounded-2xl sm:rounded-[24px] shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b  mb-1">
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
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                      isSelected 
                        ? "bg-amber-50/50 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400" 
                        : "hover:bg-accent/50 dark:hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`size-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected 
                          ? "bg-amber-400 text-foreground shadow-sm" 
                          : "bg-muted text-foreground"
                      }`}>
                        {studentInitials}
                      </span>
                      <div className="space-y-0.5">
                        <span className={`text-sm font-semibold block ${isSelected ? "text-foreground" : "text-foreground"}`}>{student.name}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{student.className}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-bold text-amber-500 uppercase">Selected</span>
                         <Check className="size-4 text-amber-500" />
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
