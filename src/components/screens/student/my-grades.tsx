'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/use-app-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, PieChart, Pie } from 'recharts';
import {
  TrendingUp, Award, BarChart3, Star, GraduationCap,
  CircleDot, CheckCircle2,
} from 'lucide-react';
import type { GradeRecord, StudentInfo } from '@/lib/types';

export function StudentGrades() {
  const { currentUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  const student = students.find(s => s.email === currentUser?.email) || students[0] || null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        fetch('/api/students'),
        fetch(`/api/grades?studentId=${student?.id || ''}`),
      ]);
      const [studentsData] = await Promise.all([studentsRes.json()]);
      const gradesData = await gradesRes.json();
      setStudents(studentsData);
      if (student?.id) {
        setGrades(gradesData);
      } else {
        setGrades(studentsData.length > 0
          ? await (await fetch(`/api/grades?studentId=${studentsData[0].id}`)).json()
          : []
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const studentId = student?.id || students[0]?.id || '';

  // Re-fetch grades when we get studentId
  useEffect(() => {
    if (!studentId || grades.length > 0) return;
    fetch(`/api/grades?studentId=${studentId}`)
      .then(r => r.json())
      .then(setGrades)
      .catch(() => {});
  }, [studentId, grades.length]);

  const filteredGrades = useMemo(() => {
    if (activeTab === 'all') return grades;
    return grades.filter(g => g.examType.toLowerCase() === activeTab);
  }, [grades, activeTab]);

  // Computed analytics
  const overallAvg = useMemo(() => {
    if (!grades.length) return 0;
    return Math.round(grades.reduce((s, g) => s + (g.marks / g.maxMarks) * 100, 0) / grades.length);
  }, [grades]);

  const gradeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    grades.forEach(g => {
      const letter = g.grade || 'N/A';
      dist[letter] = (dist[letter] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([grade, count]) => ({ grade, count }));
  }, [grades]);

  const gradeColorMap: Record<string, string> = {
    'A+': '#8b5cf6', 'A': '#7c3aed', 'B+': '#6366f1', 'B': '#3b82f6',
    'C': '#f59e0b', 'D': '#ef4444', 'N/A': '#9ca3af',
  };

  // Chart: bar chart of marks by subject for latest exam
  const latestExam = useMemo(() => {
    if (!grades.length) return { data: [], label: '' };
    const examTypes = [...new Set(grades.map(g => g.examType))];
    const latest = examTypes[0];
    const examGrades = grades.filter(g => g.examType === latest);
    const data = examGrades.map(g => ({
      subject: g.subjectName.length > 15 ? g.subjectName.slice(0, 12) + '...' : g.subjectName,
      marks: Math.round((g.marks / g.maxMarks) * 100),
      fill: (g.marks / g.maxMarks) * 100 >= 80 ? '#8b5cf6' : (g.marks / g.maxMarks) * 100 >= 60 ? '#a78bfa' : '#f59e0b',
    }));
    return { data, label: latest };
  }, [grades]);

  // Pie chart data for grade distribution
  const pieData = gradeDistribution.map(g => ({
    name: g.grade,
    value: g.count,
    fill: gradeColorMap[g.grade] || '#9ca3af',
  }));

  const chartConfig = {
    marks: { label: 'Score %', color: '#8b5cf6' },
  };

  if (loading) return <GradesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Grades</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">
          Track your academic performance across all subjects
        </p>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mb-3">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{overallAvg}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Overall Average</p>
            <Progress value={overallAvg} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-3">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{grades.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Total Records</p>
            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-400 dark:text-gray-500">
              <span>{[...new Set(grades.map(g => g.subjectName))].length} subjects</span>
              <span>•</span>
              <span>{[...new Set(grades.map(g => g.examType))].length} exams</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white mb-3">
              <Star className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {gradeDistribution.find(g => g.grade === 'A+' || g.grade === 'A')?.count || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">A Grade Count</p>
            <div className="flex items-center justify-center gap-1 mt-3">
              {gradeDistribution.slice(0, 4).map(g => (
                <Badge key={g.grade} variant="secondary" className="text-[10px] px-1.5 py-0"
                  style={{ backgroundColor: gradeColorMap[g.grade] + '20', color: gradeColorMap[g.grade] }}>
                  {g.grade}: {g.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Bar Chart */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-500" />
              Subject Performance
            </CardTitle>
            <CardDescription className="text-xs">{latestExam.label ? `Latest: ${latestExam.label}` : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {latestExam.data.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={latestExam.data} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="subject" width={90} tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="marks" radius={[0, 6, 6, 0]} barSize={22}>
                    {latestExam.data.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">No chart data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grade Distribution Pie */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CircleDot className="h-4 w-4 text-violet-500" />
              Grade Distribution
            </CardTitle>
            <CardDescription className="text-xs">Breakdown of your grades</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-col gap-2">
                  {gradeDistribution.map(g => (
                    <div key={g.grade} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: gradeColorMap[g.grade] }} />
                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{g.grade}</span>
                      <Badge variant="secondary" className="text-[10px] ml-1">{g.count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p className="text-sm">No distribution data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grades Table with Tabs */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-violet-500" />
            All Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="midterm">Midterm</TabsTrigger>
              <TabsTrigger value="final">Final</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <ScrollArea className="max-h-[400px]">
                {filteredGrades.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No grades found for this filter</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Exam Type</TableHead>
                        <TableHead className="text-center">Marks</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrades.map((g) => {
                        const pct = Math.round((g.marks / g.maxMarks) * 100);
                        return (
                          <TableRow key={g.id}>
                            <TableCell className="font-medium">{g.subjectName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">
                                {g.examType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-sm">{g.marks}</span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">/{g.maxMarks}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Progress value={pct} className="w-16 h-1.5" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{pct}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                className={`text-xs font-semibold ${
                                  pct >= 80 ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700' :
                                  pct >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700' :
                                  pct >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' :
                                  'bg-red-100 dark:bg-red-900/30 text-red-700'
                                }`}
                              >
                                {g.grade || 'N/A'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function GradesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
