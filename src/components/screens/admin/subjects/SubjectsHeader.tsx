"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SubjectsHeaderProps {
  totalSubjects: number;
  canCreate: boolean;
  onAddClick: () => void;
}

export function SubjectsHeader({ totalSubjects, canCreate, onAddClick }: SubjectsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="w-full text-center sm:text-left sm:w-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Subjects
        </h2>
        <p className="hidden sm:block text-xs sm:text-sm text-muted-foreground mt-0.5">
          {totalSubjects} subjects across all classes
        </p>
      </div>
      {canCreate && (
        <Button className="hidden sm:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={onAddClick}>
          <Plus className="size-4 mr-2" /> Add Subject
        </Button>
      )}
    </div>
  );
}
