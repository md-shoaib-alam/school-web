import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface GradesHeaderProps {
  topLevelTab: "exams" | "assessments";
  academicYears: Array<{ id: string; name: string; isCurrent: boolean }>;
  selectedYear: string;
  onSelectedYearChange: (year: string) => void;
}

export function GradesHeader({
  topLevelTab,
  academicYears,
  selectedYear,
  onSelectedYearChange,
}: GradesHeaderProps) {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {topLevelTab === "exams" ? "School Exams" : "Class Assessments"}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          {topLevelTab === "exams"
            ? "Track your official term examinations and standardized scores"
            : "Monitor your periodic teacher assignments, classwork, and quizzes"}
        </p>
      </div>
      {topLevelTab === "exams" && (
        <div className="flex items-center gap-2 flex-wrap">
          {academicYears.length > 0 && (
            <Select value={selectedYear} onValueChange={onSelectedYearChange}>
              <SelectTrigger className="w-[160px] h-9 text-sm">
                <SelectValue placeholder="Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((y) => (
                  <SelectItem key={y.id} value={y.name}>
                    {y.name}
                    {y.isCurrent ? " (Current)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {slug && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 text-sm font-medium border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950/30"
              onClick={() => router.push(`/${slug}/view-marksheet`)}
            >
              <FileText className="size-4" />
              View Marksheet
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
