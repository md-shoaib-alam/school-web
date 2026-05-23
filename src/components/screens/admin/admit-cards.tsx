'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText, Printer, Loader2, School,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { goeyToast as toast } from "goey-toast";
import { api, apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

// Sub-components
import { ClassSelector } from './admit-cards/ClassSelector';
import { ConfigurationCard } from './admit-cards/ConfigurationCard';
import { GeneratedCardsTable } from './admit-cards/GeneratedCardsTable';
import { ViewCardDialog } from './admit-cards/ViewCardDialog';
import { BatchPrintContainers } from './admit-cards/BatchPrintContainers';

// Types
interface StudentInfo {
  id: string;
  rollNumber: string;
  name: string;
  avatar: string | null;
  initials: string;
  dateOfBirth: string | null;
  parentName: string;
}

interface ExamSchedule {
  id: string;
  name: string;
  examType: string;
  subjectName: string;
  subjectCode: string;
  date: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  status: string;
  resultPublished?: boolean;
}

interface AdmitCard {
  cardNumber: string;
  student: StudentInfo;
  class: { id: string; name: string; section: string; grade: string };
  school: {
    name: string;
    address: string | null;
    phone: string | null;
    logo: string | null;
  } | null;
  exams: ExamSchedule[];
  generatedAt: string;
}

const examTypeColors: Record<string, string> = {
  unit_test: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  midterm: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  final: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  quiz: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  practical: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
};

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getExamTypeColor(type: string): string {
  return examTypeColors[type] || 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-400';
}

export function AdminAdmitCards() {
  const queryClient = useQueryClient();
  const singleCardRef = useRef<HTMLDivElement>(null);
  const allCardsRef = useRef<HTMLDivElement>(null);
  const todayDateString = useMemo(() => getTodayDateString(), []);

  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [generating, setGenerating] = useState(false);
  const [deselectedStudentIds, setDeselectedStudentIds] = useState<Set<string>>(new Set());
  const [viewCard, setViewCard] = useState<AdmitCard | null>(null);
  const [preparingPrint, setPreparingPrint] = useState(false);

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes-min'],
    queryFn: async () => {
      const data = await api.get('/classes?mode=min');
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        grade: c.grade,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: classData, isLoading: loadingClassData, refetch: refetchClassData } = useQuery({
    queryKey: ['admit-card-data', selectedClassId],
    queryFn: () => api.get(`/admit-cards?classId=${selectedClassId}`),
    enabled: !!selectedClassId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const availableExamTypes = useMemo<string[]>(() => {
    if (!classData?.exams) return [];
    const activeExams = classData.exams.filter((e: any) => {
      const isScheduled = e.status?.trim().toLowerCase() === 'scheduled';
      const isUpcoming = e.date >= todayDateString;
      return (isScheduled || isUpcoming) && !e.resultPublished;
    });
    const types = new Set(activeExams.map((e: any) => e.examType));
    return Array.from(types) as string[];
  }, [classData, todayDateString]);

  const currentExamType = selectedExamType || availableExamTypes[0] || '';

  const selectedStudentIds = useMemo<Set<string>>(() => {
    if (!classData?.students) return new Set<string>();
    const allIds = classData.students.map((s: any) => s.id as string);
    return new Set<string>(allIds.filter((id) => !deselectedStudentIds.has(id)));
  }, [classData, deselectedStudentIds]);

  const selectAll = useMemo(() => {
    if (!classData?.students || classData.students.length === 0) return false;
    return deselectedStudentIds.size === 0;
  }, [classData, deselectedStudentIds]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setAdmitCards([]);
    setSelectedExamType('');
    setDeselectedStudentIds(new Set());
  };

  const handleGenerate = async () => {
    if (!selectedClassId) { toast.error('Please select a class'); return; }
    if (selectedStudentIds.size === 0) { toast.error('Please select at least one student'); return; }

    setGenerating(true);
    try {
      const res = await apiFetch('/api/admit-cards', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          examType: currentExamType,
          studentIds: Array.from(selectedStudentIds),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdmitCards(data.admitCards);
        toast.success(`${data.totalGenerated} admit card${data.totalGenerated !== 1 ? 's' : ''} generated successfully!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to generate admit cards');
      }
    } catch { toast.error('Error generating admit cards'); }
    setGenerating(false);
  };

  const toggleStudent = (id: string) => {
    setDeselectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (!classData) return;
    if (selectAll) {
      setDeselectedStudentIds(new Set(classData.students.map((s: any) => s.id)));
    } else {
      setDeselectedStudentIds(new Set());
    }
  };

  const handlePrintSingle = useReactToPrint({
    contentRef: singleCardRef,
    documentTitle: "",
  });

  const handlePrintAllBase = useReactToPrint({
    contentRef: allCardsRef,
    documentTitle: `Admit_Cards_${selectedClassId}`,
    onAfterPrint: () => setPreparingPrint(false),
  });

  const handlePrintAll = useCallback(async () => {
    setPreparingPrint(true);
    setTimeout(() => {
      handlePrintAllBase();
    }, 500);
  }, [handlePrintAllBase]);

  const totalStudents = classData?.students.length || 0;
  const totalExams = classData ? (
    classData.exams.filter((e: any) => {
      const isScheduled = e.status?.trim().toLowerCase() === 'scheduled';
      const isUpcoming = e.date >= todayDateString;
      return e.examType === currentExamType && (isScheduled || isUpcoming) && !e.resultPublished;
    }).length
  ) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <FileText className="size-6 text-amber-600" />
            Admit Cards
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Generate exam admit cards (hall tickets) for students
          </p>
        </div>
        {admitCards.length > 0 && (
          <Button 
            onClick={handlePrintAll} 
            disabled={preparingPrint}
            className="gap-2 bg-zinc-800 hover:bg-zinc-900 text-white"
          >
            {preparingPrint ? <Loader2 className="size-4 animate-spin" /> : <Printer className="size-4" />}
            {preparingPrint ? 'Preparing...' : `Print All (${admitCards.length})`}
          </Button>
        )}
      </div>

      <BatchPrintContainers 
        preparingPrint={preparingPrint}
        allCardsRef={allCardsRef}
        singleCardRef={singleCardRef}
        admitCards={admitCards}
        viewCard={viewCard}
        selectedClassId={selectedClassId}
      />

      <div className="space-y-6">
        <ClassSelector 
          selectedClassId={selectedClassId}
          onClassChange={handleClassChange}
          classes={classes}
          loadingClasses={loadingClasses}
          loadingClassData={loadingClassData}
          onSyncData={() => { queryClient.invalidateQueries({ queryKey: ['admit-card-data', selectedClassId] }); refetchClassData(); }}
        />

        {classData && (
          <ConfigurationCard 
            availableExamTypes={availableExamTypes}
            selectedExamType={selectedExamType}
            setSelectedExamType={setSelectedExamType}
            classData={classData}
            todayDateString={todayDateString}
            totalStudents={totalStudents}
            totalExams={totalExams}
            selectedStudentIds={selectedStudentIds}
            selectAll={selectAll}
            onToggleAll={handleToggleAll}
            onToggleStudent={toggleStudent}
            onGenerate={handleGenerate}
            generating={generating}
            onPrintAll={handlePrintAll}
            admitCardsCount={admitCards.length}
            preparingPrint={preparingPrint}
          />
        )}

        {loadingClassData && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {admitCards.length > 0 && (
          <GeneratedCardsTable 
            admitCards={admitCards}
            onView={setViewCard}
            getExamTypeColor={getExamTypeColor}
          />
        )}

        {!loadingClasses && classes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <School className="size-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No classes found</p>
              <p className="text-sm">Create classes first in the Classes section</p>
            </CardContent>
          </Card>
        )}
      </div>

      <ViewCardDialog 
        card={viewCard}
        onOpenChange={(open) => !open && setViewCard(null)}
        onPrint={() => handlePrintSingle()}
      />
    </div>
  );
}
