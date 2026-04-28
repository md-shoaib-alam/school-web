'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Search, Filter, MoreVertical, Edit2, Trash2, Calendar, Clock, 
  FileText, Pencil, ClipboardList, RefreshCw 
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExamRecord } from './types';

interface ExamTableProps {
  exams: ExamRecord[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenResults: (exam: ExamRecord) => void;
  onOpenEdit: (exam: ExamRecord) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
  formatDate: (date: string) => string;
  formatTime: (time: string | null | undefined) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getExamTypeBadge: (type: string) => React.ReactNode;
}

export function ExamTable({
  exams,
  loading,
  searchTerm,
  setSearchTerm,
  onOpenResults,
  onOpenEdit,
  onDelete,
  deleting,
  formatDate,
  formatTime,
  getStatusBadge,
  getExamTypeBadge,
}: ExamTableProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams or subjects..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Exam Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Class</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Timing</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}><div className="h-4 w-full bg-muted animate-pulse rounded" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mb-2 opacity-20" />
                      <p>No exams found matching your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm whitespace-nowrap">{exam.name}</span>
                        <div className="scale-[0.8] origin-left">{getExamTypeBadge(exam.examType)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{exam.subjectName}</span>
                        <span className="text-[9px] text-muted-foreground font-mono leading-none">CODE: {exam.id.slice(-4).toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="font-normal text-xs">
                        {exam.className}-{exam.classSection}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(exam.date)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center text-sm text-muted-foreground">
                      {formatTime(exam.startTime)} – {formatTime(exam.endTime)}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(exam.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => onOpenResults(exam)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Results
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => onOpenEdit(exam)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{exam.name}"? This will also delete all student results for this exam.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(exam.id)}
                                disabled={deleting}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleting ? 'Deleting...' : 'Delete Permanently'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
