'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, Clock, Search, CheckCircle2, Eye } from 'lucide-react';
import type { AttendanceRecord, ClassInfo } from '@/lib/types';
import { useModulePermissions } from '@/hooks/use-permissions';
import { useAttendance, useClasses } from '@/lib/graphql/hooks';

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: React.ReactNode }> = {
  present: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    text: 'Present',
    dot: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
  absent: {
    bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    text: 'Absent',
    dot: 'bg-red-500',
    icon: <UserX className="h-3.5 w-3.5 text-red-500" />,
  },
  late: {
    bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    text: 'Late',
    dot: 'bg-amber-500',
    icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  },
};

export function AdminAttendance() {
  const { canCreate, canEdit, canDelete } = useModulePermissions('attendance');
  const { data: rawRecords = [], isLoading: recordsLoading } = useAttendance();
  const { data: classData = [], isLoading: classesLoading } = useClasses();
  
  const loading = recordsLoading || classesLoading;
  const classes = classData as ClassInfo[];
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('all');

  const records = rawRecords.filter(r => {
    // Basic frontend filtering matching the GraphQL records which don't take variables yet
    const matchDate = !selectedDate || r.date.startsWith(selectedDate);
    // Note: since our GraphQL classes resolver returns name-section, we need to adapt if selectedClass is an ID
    const matchClass = selectedClass === 'all' || classes.find(c => c.id === selectedClass)?.name + '-' + classes.find(c => c.id === selectedClass)?.section === r.className;
    return matchDate && matchClass;
  });

  // Summary stats
  const presentCount = records.filter((r) => r.status === 'present').length;
  const absentCount = records.filter((r) => r.status === 'absent').length;
  const lateCount = records.filter((r) => r.status === 'late').length;
  const total = records.length;
  const presentRate = total > 0 ? ((presentCount + lateCount) / total * 100).toFixed(1) : '0';

  const summaryCards = [
    {
      label: 'Present',
      count: presentCount,
      percentage: total > 0 ? ((presentCount / total) * 100).toFixed(1) : '0',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      label: 'Absent',
      count: absentCount,
      percentage: total > 0 ? ((absentCount / total) * 100).toFixed(1) : '0',
      icon: <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    {
      label: 'Late',
      count: lateCount,
      percentage: total > 0 ? ((lateCount / total) * 100).toFixed(1) : '0',
      icon: <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      label: 'Attendance Rate',
      count: `${presentRate}%`,
      percentage: null,
      icon: <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {!canCreate && !canEdit && !canDelete && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-3 py-2">
          <Eye className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Read-only mode — you have view permission only for this module.</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-48"
        />
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}-{c.section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground sm:ml-auto">
          {records.length} records
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className={`border ${card.borderColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.count}</p>
                  {card.percentage && (
                    <p className="text-xs text-muted-foreground mt-0.5">{card.percentage}%</p>
                  )}
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
          <CardDescription>
            {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="w-32 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No attendance records found</p>
                        <p className="text-sm">Try selecting a different date or class</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => {
                      const config = statusConfig[record.status] || statusConfig.present;
                      return (
                        <TableRow key={record.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold">
                                {record.studentName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">{record.studentName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`${config.bg} font-medium capitalize`}>
                              {config.icon}
                              <span className="ml-1">{record.status}</span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
