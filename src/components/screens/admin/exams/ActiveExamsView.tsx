'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, CalendarDays, CheckCircle2, Clock, 
  Search, GraduationCap, ChevronDown, ArrowLeft
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ExamTable } from './ExamTable';
import { getGroupedExams } from './utils';
import { ExamRecord, ClassOption } from './types';

interface ActiveExamsViewProps {
  exams: ExamRecord[];
  classes: ClassOption[];
  loadingExams: boolean;
  deleting: boolean;
  handleDelete: (id: string) => Promise<void>;
  setEditForm: (form: any) => void;
  setEditOpen: (open: boolean) => void;
  handleOpenViewResults: (exam: ExamRecord) => Promise<void>;
  formatDate: (d: string) => string;
  formatTime: (t: any) => string;
  getStatusBadge: (s: string) => React.ReactNode;
  getExamTypeBadge: (t: string) => React.ReactNode;
  classFilter: string;
  setClassFilter: (c: string) => void;
}

export function ActiveExamsView({
  exams,
  classes,
  loadingExams,
  deleting,
  handleDelete,
  setEditForm,
  setEditOpen,
  handleOpenViewResults,
  formatDate,
  formatTime,
  getStatusBadge,
  getExamTypeBadge,
  classFilter,
  setClassFilter,
}: ActiveExamsViewProps) {
  // Filters & State
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Computations
  const classStats = useMemo(() => {
    const stats: Record<string, { total: number; scheduled: number; completed: number }> = {};
    exams.forEach(exam => {
      if (!stats[exam.classId]) {
        stats[exam.classId] = { total: 0, scheduled: 0, completed: 0 };
      }
      stats[exam.classId].total++;
      if (exam.status === 'scheduled') stats[exam.classId].scheduled++;
      if (exam.status === 'completed') stats[exam.classId].completed++;
    });
    return stats;
  }, [exams]);

  const filtered = useMemo(() => {
    return exams.filter(exam => {
      const matchClass = classFilter === 'all' || exam.classId === classFilter;
      const matchStatus = statusFilter === 'all' || exam.status === statusFilter;
      const matchSearch = exam.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                         exam.subjectName.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchClass && matchStatus && matchSearch;
    });
  }, [exams, classFilter, statusFilter, debouncedSearch]);

  const currentExamsForSummary = useMemo(() => {
    return classFilter === 'all' 
      ? exams 
      : exams.filter(e => e.classId === classFilter);
  }, [exams, classFilter]);

  const classesWithActiveExams = useMemo(() => {
    return classes.filter(c => 
      filtered.some(e => e.classId === c.id && e.status !== 'completed')
    );
  }, [classes, filtered]);

  const summaryCards = [
    { label: 'Total Exams', value: currentExamsForSummary.length, icon: <ClipboardList />, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { label: 'Scheduled', value: currentExamsForSummary.filter(e => e.status === 'scheduled').length, icon: <CalendarDays />, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
    { label: 'Completed', value: currentExamsForSummary.filter(e => e.status === 'completed').length, icon: <CheckCircle2 />, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { label: 'Upcoming', value: currentExamsForSummary.filter(e => e.date && e.date >= new Date().toISOString().split('T')[0]).length, icon: <Clock />, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{card.label}</p>
                <h4 className="text-2xl font-semibold mt-1">{card.value}</h4>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {classFilter === 'all' ? (
        exams.filter(e => e.status !== 'completed').length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-card text-center text-muted-foreground animate-in fade-in duration-300">
            <ClipboardList className="h-16 w-16 mb-4 text-blue-500/40" />
            <h3 className="text-lg font-semibold text-foreground">No Active Exams Scheduled</h3>
            <p className="text-sm mt-1 max-w-md">There are no midterm or final exams currently scheduled for any class. Click "New Exam" to start scheduling!</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Global Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3 rounded-xl border border-gray-100 dark:border-zinc-800/80 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams by subject or name..."
                  className="pl-9 h-9 border-gray-200 dark:border-zinc-800 text-sm focus-visible:ring-blue-500 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-[150px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 border-gray-200 dark:border-zinc-800 rounded-lg text-xs font-semibold">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
                      <SelectItem value="scheduled" className="text-xs font-medium">Scheduled</SelectItem>
                      <SelectItem value="ongoing" className="text-xs font-medium">Ongoing</SelectItem>
                      <SelectItem value="completed" className="text-xs font-medium">Published</SelectItem>
                      <SelectItem value="cancelled" className="text-xs font-medium">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchTerm || statusFilter !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    className="text-xs text-muted-foreground hover:text-foreground h-9 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors shrink-0"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {classesWithActiveExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-card text-center text-muted-foreground animate-in fade-in duration-300">
                <Search className="h-12 w-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                <h3 className="text-base font-semibold text-foreground">No matching exams found</h3>
                <p className="text-xs mt-1 max-w-md">No exams match your search text or status filter. Try clearing or modifying your filter criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold tracking-tight text-foreground/80">Select a Class to View Exams</h3>
                </div>
                <div className="flex flex-col gap-4">
                  {classesWithActiveExams.map((c: any) => {
                    const isExpanded = !!expandedClasses[c.id];
                    const classExams = filtered.filter(e => e.classId === c.id && e.status !== 'completed');
                    const stats = classStats[c.id] || { total: 0, scheduled: 0, completed: 0 };
                    
                    return (
                      <Card 
                        key={c.id} 
                        className={`border dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md bg-card relative py-0 gap-0 ${isExpanded ? 'border-l-4 border-l-blue-600 dark:border-l-blue-500 border-gray-200' : 'border-gray-100'}`}
                      >
                        <div 
                          onClick={() => setExpandedClasses(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                          className={`py-2.5 px-4 flex items-center justify-between cursor-pointer hover:bg-accent/40 transition-colors select-none ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg transition-all duration-300 ${isExpanded ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'}`}>
                              <GraduationCap className="h-5 w-5 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-foreground leading-tight">
                                {c.name} - {c.section}
                              </h3>
                              <p className="text-[11px] text-muted-foreground mt-0 font-medium">
                                {classExams.length} active exam{classExams.length !== 1 ? 's' : ''} scheduled
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                                {stats.completed} Completed
                              </span>
                            </div>
                            <div className={`p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400' : 'bg-gray-50 dark:bg-zinc-900 text-muted-foreground'}`}>
                              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2500px] border-t border-gray-100 dark:border-zinc-800' : 'max-h-0'}`}>
                          <div className="p-4 bg-zinc-50/30 dark:bg-zinc-950/10 space-y-4">
                            {getGroupedExams(classExams).map((group) => {
                              const groupKey = `${group.cycleName}::${group.academicYear}`;
                              return (
                                <Card key={groupKey} className="border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden bg-card">
                                  <div className="px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <ClipboardList className="h-4.5 w-4.5 text-blue-500" />
                                      <span className="font-bold text-sm text-foreground">{group.cycleName}</span>
                                      <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0 border-zinc-200 dark:border-zinc-800 text-muted-foreground bg-zinc-100/50 dark:bg-zinc-900/50">
                                        {group.academicYear}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground font-medium">
                                        {group.exams.length} subject{group.exams.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-0">
                                    <ExamTable
                                      exams={group.exams} loading={loadingExams} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                                      onOpenEdit={(e) => { setEditForm({ ...e, totalMarks: String(e.totalMarks), passingMarks: String(e.passingMarks) }); setEditOpen(true); }}
                                      onDelete={handleDelete} deleting={deleting} formatDate={formatDate} formatTime={formatTime}
                                      getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
                                      onViewResults={handleOpenViewResults}
                                      classFilter={c.id} setClassFilter={setClassFilter}
                                      statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                                      classes={classes}
                                      hideClassFilter={true}
                                      flat={true}
                                      hideSearchAndFilter={true}
                                    />
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )
      ) : (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setClassFilter('all')}
              className="gap-1.5 px-3 py-1.5 h-8 text-xs font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Classes
            </Button>
            <h3 className="text-lg font-semibold text-foreground">
              Exams for {classes.find((c: any) => c.id === classFilter)?.name} - {classes.find((c: any) => c.id === classFilter)?.section}
            </h3>
          </div>
          <ExamTable
            exams={filtered.filter(e => e.status !== 'completed')} loading={loadingExams} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            onOpenEdit={(e) => { setEditForm({ ...e, totalMarks: String(e.totalMarks), passingMarks: String(e.passingMarks) }); setEditOpen(true); }}
            onDelete={handleDelete} deleting={deleting} formatDate={formatDate} formatTime={formatTime}
            getStatusBadge={getStatusBadge} getExamTypeBadge={getExamTypeBadge}
            onViewResults={handleOpenViewResults}
            classFilter={classFilter} setClassFilter={setClassFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            classes={classes}
            hideClassFilter={true}
          />
        </div>
      )}
    </div>
  );
}
