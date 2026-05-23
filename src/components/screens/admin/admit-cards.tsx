'use client';

import { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
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

// Reducer State & Types
interface AdmitCardState {
  selectedClassId: string;
  selectedExamType: string;
  admitCards: AdmitCard[];
  generating: boolean;
  deselectedStudentIds: Set<string>;
  viewCard: AdmitCard | null;
  preparingPrint: boolean;
}

type AdmitCardAction =
  | { type: 'SET_CLASS_ID'; classId: string }
  | { type: 'SET_EXAM_TYPE'; examType: string }
  | { type: 'SET_ADMIT_CARDS'; admitCards: AdmitCard[] }
  | { type: 'SET_GENERATING'; generating: boolean }
  | { type: 'TOGGLE_STUDENT'; id: string }
  | { type: 'TOGGLE_ALL_STUDENTS'; selectAll: boolean; studentIds: string[] }
  | { type: 'SET_VIEW_CARD'; card: AdmitCard | null }
  | { type: 'SET_PREPARING_PRINT'; preparing: boolean };

const initialAdmitCardState: AdmitCardState = {
  selectedClassId: '',
  selectedExamType: '',
  admitCards: [],
  generating: false,
  deselectedStudentIds: new Set<string>(),
  viewCard: null,
  preparingPrint: false,
};

function admitCardReducer(state: AdmitCardState, action: AdmitCardAction): AdmitCardState {
  switch (action.type) {
    case 'SET_CLASS_ID':
      return {
        ...state,
        selectedClassId: action.classId,
        admitCards: [],
        selectedExamType: '',
        deselectedStudentIds: new Set<string>(),
      };
    case 'SET_EXAM_TYPE':
      return {
        ...state,
        selectedExamType: action.examType,
      };
    case 'SET_ADMIT_CARDS':
      return {
        ...state,
        admitCards: action.admitCards,
      };
    case 'SET_GENERATING':
      return {
        ...state,
        generating: action.generating,
      };
    case 'TOGGLE_STUDENT': {
      const next = new Set(state.deselectedStudentIds);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return {
        ...state,
        deselectedStudentIds: next,
      };
    }
    case 'TOGGLE_ALL_STUDENTS':
      return {
        ...state,
        deselectedStudentIds: action.selectAll ? new Set<string>(action.studentIds) : new Set<string>(),
      };
    case 'SET_VIEW_CARD':
      return {
        ...state,
        viewCard: action.card,
      };
    case 'SET_PREPARING_PRINT':
      return {
        ...state,
        preparingPrint: action.preparing,
      };
    default:
      return state;
  }
}

export function AdminAdmitCards() {
  const queryClient = useQueryClient();
  const singleCardRef = useRef<HTMLDivElement>(null);
  const allCardsRef = useRef<HTMLDivElement>(null);
  const todayDateString = useMemo(() => getTodayDateString(), []);

  const [state, dispatch] = useReducer(admitCardReducer, initialAdmitCardState);
  
  // Load Admit Card Preview Preference
  const [enableModalAdmitCardPreview, setEnableModalAdmitCardPreview] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic_quad');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/api/tenant-settings");
        if (res.ok) {
          const data = await res.json();
          setEnableModalAdmitCardPreview(data.enableModalAdmitCardPreview === true);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);
  const {
    selectedClassId,
    selectedExamType,
    admitCards,
    generating,
    deselectedStudentIds,
    viewCard,
    preparingPrint,
  } = state;

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

  const availableCycles = useMemo(() => {
    if (!classData?.exams) return [];
    const activeExams = classData.exams.filter((e: any) => {
      const isScheduled = e.status?.trim().toLowerCase() === 'scheduled';
      const isUpcoming = e.date >= todayDateString;
      return (isScheduled || isUpcoming) && !e.resultPublished;
    });

    const groups: Record<string, { cycleName: string; examType: string; exams: any[] }> = {};
    activeExams.forEach((e: any) => {
      const cycleName = e.name.includes(' - ') ? e.name.split(' - ')[0] : e.name;
      const key = `${cycleName}::${e.examType}`;
      if (!groups[key]) {
        groups[key] = {
          cycleName,
          examType: e.examType,
          exams: []
        };
      }
      groups[key].exams.push(e);
    });

    return Object.values(groups).sort((a, b) => a.cycleName.localeCompare(b.cycleName));
  }, [classData, todayDateString]);

  const availableExamTypes = useMemo<string[]>(() => {
    return availableCycles.map(c => `${c.cycleName}::${c.examType}`);
  }, [availableCycles]);

  const currentExamType = selectedExamType || availableExamTypes[0] || '';

  const currentCycle = useMemo(() => {
    if (availableCycles.length === 0) return null;
    return availableCycles.find(c => `${c.cycleName}::${c.examType}` === currentExamType) || availableCycles[0];
  }, [availableCycles, currentExamType]);

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
    dispatch({ type: 'SET_CLASS_ID', classId });
  };

  const handleGenerate = async () => {
    if (!selectedClassId) { toast.error('Please select a class'); return; }
    if (selectedStudentIds.size === 0) { toast.error('Please select at least one student'); return; }

    dispatch({ type: 'SET_GENERATING', generating: true });
    try {
      const examIds = currentCycle?.exams.map((e: any) => e.id) || [];
      const res = await apiFetch('/api/admit-cards', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          examType: currentCycle?.examType || '',
          examIds,
          studentIds: Array.from(selectedStudentIds),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: 'SET_ADMIT_CARDS', admitCards: data.admitCards });
        toast.success(`${data.totalGenerated} admit card${data.totalGenerated !== 1 ? 's' : ''} generated successfully!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to generate admit cards');
      }
    } catch { toast.error('Error generating admit cards'); }
    dispatch({ type: 'SET_GENERATING', generating: false });
  };

  const toggleStudent = (id: string) => {
    dispatch({ type: 'TOGGLE_STUDENT', id });
  };

  const handleToggleAll = () => {
    if (!classData) return;
    dispatch({
      type: 'TOGGLE_ALL_STUDENTS',
      selectAll,
      studentIds: classData.students.map((s: any) => s.id),
    });
  };

  const handlePrintSingle = useReactToPrint({
    contentRef: singleCardRef,
    documentTitle: "",
  });

  const handlePrintAllBase = useReactToPrint({
    contentRef: allCardsRef,
    documentTitle: `Admit_Cards_${selectedClassId}`,
    onAfterPrint: () => dispatch({ type: 'SET_PREPARING_PRINT', preparing: false }),
  });

  const handlePrintAll = useCallback(async () => {
    if (enableModalAdmitCardPreview) {
      dispatch({ type: 'SET_PREPARING_PRINT', preparing: true });
      setTimeout(() => {
        handlePrintAllBase();
      }, 500);
    } else {
      const activeClass = classes.find((c: any) => c.id === selectedClassId);
      const classNameStr = activeClass?.name || 'Class';
      const classSection = activeClass?.section || '';
      
      toast.promise(
        (async () => {
          const { handleAdmitCardPreviewNewTab } = await import('./admit-cards/admitCardPrinter');
          await handleAdmitCardPreviewNewTab({
            admitCards,
            classNameStr,
            classSection,
          });
        })(),
        {
          loading: 'Loading admit card workspace...',
          success: 'Admit card workspace opened in a new tab!',
          error: 'Failed to load admit card workspace',
        }
      );
    }
  }, [enableModalAdmitCardPreview, handlePrintAllBase, classes, selectedClassId, admitCards]);

  const totalStudents = classData?.students.length || 0;
  const totalExams = currentCycle?.exams.length || 0;

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
        templateId={selectedTemplate}
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
            selectedExamType={currentExamType}
            setSelectedExamType={(examType) => dispatch({ type: 'SET_EXAM_TYPE', examType })}
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
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
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
            onView={(card) => dispatch({ type: 'SET_VIEW_CARD', card })}
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
        onOpenChange={(open) => !open && dispatch({ type: 'SET_VIEW_CARD', card: null })}
        onPrint={() => handlePrintSingle()}
        templateId={selectedTemplate}
      />
    </div>
  );
}
