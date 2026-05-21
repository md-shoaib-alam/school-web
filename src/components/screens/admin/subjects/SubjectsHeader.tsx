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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Subjects
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {totalSubjects} subjects across all classes
        </p>
      </div>
      {canCreate && (
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onAddClick}>
          <Plus className="size-4 mr-2" /> Add Subject
        </Button>
      )}
    </div>
  );
}
