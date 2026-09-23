'use client';

import { Calendar, GraduationCap, FileText, Trophy, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExamsHeaderProps {
  activeTab: string;
  onNewExamClick: () => void;
  academicYears?: { id: string; name: string; isCurrent?: boolean }[];
  currentAcademicYear?: string;
  selectedAcademicYear?: string;
  onAcademicYearChange?: (year: string) => void;
}

export function ExamsHeader({ 
  activeTab, 
  onNewExamClick,
  academicYears = [],
  currentAcademicYear,
  selectedAcademicYear,
  onAcademicYearChange,
}: ExamsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Title with Blue Calendar Icon - Hidden on Mobile */}
      <div className="hidden md:flex items-center gap-3.5">
        <div className="size-11 sm:size-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 shadow-xs">
          {activeTab === 'exams' && <Calendar className="size-5 sm:size-6" />}
          {activeTab === 'results' && <FileText className="size-5 sm:size-6 text-orange-600" />}
          {activeTab === 'published' && <Trophy className="size-5 sm:size-6 text-yellow-600" />}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {activeTab === 'exams' && "Exams"}
            {activeTab === 'results' && "Results Entry"}
            {activeTab === 'published' && "Published Results"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeTab === 'exams' && "Create and manage all school examinations."}
            {activeTab === 'results' && "Input and update student marks for completed exams."}
            {activeTab === 'published' && "View and review finalized exam outcomes."}
          </p>
        </div>
      </div>

      {/* Header Actions: Academic Year & New Exam Button */}
      {activeTab === 'exams' && (
        <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">Academic Year:</span>
            <Select 
              value={selectedAcademicYear || currentAcademicYear || '2026 - 2027'} 
              onValueChange={onAcademicYearChange}
            >
              <SelectTrigger className="h-9 bg-card border-border/80 text-xs sm:text-sm font-medium rounded-xl gap-2 px-3 w-full sm:min-w-[170px] shadow-2xs">
                <GraduationCap className="size-4 text-blue-600 shrink-0" />
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {academicYears.length > 0 ? (
                  academicYears.map((ay) => (
                    <SelectItem key={ay.id} value={ay.name} className="text-xs sm:text-sm font-medium">
                      {ay.name} {ay.isCurrent ? '(Current)' : ''}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="2026 - 2027" className="text-xs sm:text-sm font-medium">2026 - 2027 (Current)</SelectItem>
                    <SelectItem value="2025 - 2026" className="text-xs sm:text-sm font-medium">2025 - 2026</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={onNewExamClick} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 px-3.5 sm:px-4 rounded-xl gap-1.5 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span className="text-xs sm:text-sm">New Exam</span>
          </Button>
        </div>
      )}
    </div>
  );
}

