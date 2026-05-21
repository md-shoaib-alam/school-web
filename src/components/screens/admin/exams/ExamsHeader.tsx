'use client';

import { GraduationCap, FileText, Trophy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExamsHeaderProps {
  activeTab: string;
  onNewExamClick: () => void;
}

export function ExamsHeader({ activeTab, onNewExamClick }: ExamsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
          {activeTab === 'exams' && <GraduationCap className="size-6 sm:h-7 sm:h-7 text-blue-600" />}
          {activeTab === 'results' && <FileText className="size-6 sm:h-7 sm:h-7 text-orange-600" />}
          {activeTab === 'published' && <Trophy className="size-6 sm:h-7 sm:h-7 text-yellow-600" />}
          <span className="truncate">
            {activeTab === 'exams' && "Scheduled Exams"}
            {activeTab === 'results' && "Results Entry"}
            {activeTab === 'published' && "Published Results"}
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-none">
          {activeTab === 'exams' && "Manage and schedule upcoming school examinations."}
          {activeTab === 'results' && "Input and update student marks for completed exams."}
          {activeTab === 'published' && "View and review finalized exam outcomes."}
        </p>
      </div>
      {activeTab === 'exams' && (
        <Button onClick={onNewExamClick} className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 px-3 sm:px-4 shrink-0 gap-2">
          <Plus className="size-4" />
          <span className="text-sm font-medium">New Exam</span>
        </Button>
      )}
    </div>
  );
}
