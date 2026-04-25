"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tag, Layers, CircleDollarSign, Plus, Users, Pencil, Trash2, Search, Bus } from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useFeeCategories, useFeeStructures, useCreateFeeStructure, useFeeAssignment, useExecuteFeeAssign } from '@/hooks/use-fees';
import { useDebounce } from '@/hooks/use-debounce';
import type { FeeStructure, FeeCategory, ClassOption } from './types';

interface SetFeesTabProps {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function SetFeesTab({ canCreate, canEdit, canDelete }: SetFeesTabProps) {
  const [yearFilter, setYearFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ feeCategoryId: '', classId: '', amount: '', academicYear: '' });
  const [adding, setAdding] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<FeeStructure | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Assign to Students dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStruct, setAssignStruct] = useState<FeeStructure | null>(null);
  const [assignSaving, setAssignSaving] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [searchStudent, setSearchStudent] = useState('');
  const debouncedSearch = useDebounce(searchStudent, 300);

  const { data: structures = [], isLoading: loadingStructures } = useFeeStructures();
  const { data: categories = [], isLoading: loadingCategories } = useFeeCategories();
  const { data: classes = [], isLoading: loadingClasses } = useQuery<ClassOption[]>({
    queryKey: ['classes', 'min'],
    queryFn: () => api.get('/classes?mode=min')
  });

  const loading = loadingStructures || loadingCategories || loadingClasses;

  const createStructure = useCreateFeeStructure();
  const queryClient = useQueryClient();

  const academicYears = useMemo(() => {
    const years = new Set(structures.map(s => s.academicYear));
    return ['all', ...Array.from(years).sort()];
  }, [structures]);

  const filtered = useMemo(() => {
    return structures.filter(s => {
      const matchYear = yearFilter === 'all' || s.academicYear === yearFilter;
      const matchCat = catFilter === 'all' || s.feeCategoryId === catFilter;
      return matchYear && matchCat;
    });
  }, [structures, yearFilter, catFilter]);

  const totalRevenue = filtered.reduce((sum, s) => sum + s.amount, 0);

  const handleAdd = async () => {
    if (!addForm.feeCategoryId || !addForm.classId || !addForm.amount || !addForm.academicYear) {
      toast.error('All fields are required');
      return;
    }
    setAdding(true);
    try {
      await createStructure.mutateAsync(addForm);
      setAddOpen(false);
      setAddForm({ feeCategoryId: '', classId: '', amount: '', academicYear: '' });
    } catch {
      // Error handled by mutation
    }
    setAdding(false);
  };

  const handleEdit = (s: FeeStructure) => {
    setEditItem(s);
    setEditAmount(String(s.amount));
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editItem || !editAmount) return;
    setSaving(true);
    try {
      await api.put('/fee-structures', { id: editItem.id, amount: Number(editAmount) });
      toast.success('Fee structure updated!');
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
      setEditOpen(false);
    } catch {
      toast.error('Error updating');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/fee-structures?id=${id}`);
      toast.success('Fee structure deleted!');
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    } catch {
      toast.error('Error deleting');
    }
    setDeleting(false);
  };

  // Assign to Students logic
  const { data: assignData, isLoading: assignLoading } = useFeeAssignment(
    assignStruct?.classId || '',
    assignStruct?.feeCategoryId || '',
    assignStruct?.academicYear || ''
  );

  const executeAssign = useExecuteFeeAssign();

  const openAssignDialog = (s: FeeStructure) => {
    setAssignStruct(s);
    setAssignOpen(true);
    setSelectedStudents(new Set<string>());
    setSearchStudent('');
  };

  useEffect(() => {
    if (assignData?.students) {
      setSelectedStudents(new Set<string>(assignData.students.filter((st: any) => st.isAssigned).map((st: any) => st.id)));
    }
  }, [assignData]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const selectAll = () => {
    if (!assignData) return;
    const all = assignData.students.filter(s => !s.isPaid);
    const allIds = new Set<string>(all.map(s => s.id));
    if (selectedStudents.size === allIds.size) setSelectedStudents(new Set<string>());
    else setSelectedStudents(allIds);
  };

  const selectTransport = () => {
    if (!assignData) return;
    const transportStudents = assignData.students.filter(s => s.hasTransport && !s.isPaid);
    if (transportStudents.length === 0) { toast.info('No transport students in this class'); return; }
    setSelectedStudents(new Set(transportStudents.map(s => s.id)));
  };

  const handleAssignSave = async () => {
    if (!assignStruct || !assignData) return;
    const currentlyAssigned = new Set(assignData.students.filter(s => s.isAssigned).map(s => s.id));
    const toAssign = [...selectedStudents].filter(id => !currentlyAssigned.has(id));
    const toRemove = [...currentlyAssigned].filter(id => !selectedStudents.has(id));
    
    if (toAssign.length === 0 && toRemove.length === 0) {
      toast.info('No changes');
      setAssignOpen(false);
      return;
    }

    setAssignSaving(true);
    try {
      const promises: Promise<any>[] = [];
      
      if (toAssign.length > 0) {
        promises.push(api.post('/fee-assign', {
          classId: assignStruct.classId,
          feeCategoryId: assignStruct.feeCategoryId,
          studentIds: toAssign,
          academicYear: assignStruct.academicYear,
          action: 'assign'
        }).then((r: any) => {
          if (r.created > 0) toast.success(`${r.created} students assigned`);
        }));
      }

      if (toRemove.length > 0) {
        promises.push(api.post('/fee-assign', {
          classId: assignStruct.classId,
          feeCategoryId: assignStruct.feeCategoryId,
          studentIds: toRemove,
          academicYear: assignStruct.academicYear,
          action: 'remove'
        }).then((r: any) => {
          if (r.removed > 0) toast.success(`${r.removed} removed`);
        }));
      }

      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ['fee-assign'] });
      setAssignOpen(false);
    } catch {
      toast.error('Error saving assignment');
    }
    setAssignSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Structures</p>
              <p className="text-2xl font-bold">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue Expected</p>
              <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Academic Year" /></SelectTrigger>
          <SelectContent>
            {academicYears.map(y => <SelectItem key={y} value={y}>{y === 'all' ? 'All Years' : y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">
          {canCreate && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Add Structure
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee Structures</CardTitle>
          <CardDescription>{filtered.length} structures found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="hidden sm:table-cell">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Academic Year</TableHead>
                    <TableHead className="text-center">Assign</TableHead>
                    {(canEdit || canDelete) && <TableHead className="w-28 text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p>No fee structures found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(s => (
                      <TableRow key={s.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-colors">
                        <TableCell>
                          <div>
                            <span className="font-medium text-sm">{s.feeCategoryName}</span>
                            <span className="text-xs text-muted-foreground ml-2">({s.feeCategoryCode})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{s.className}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell font-semibold text-emerald-600 dark:text-emerald-400">₹{s.amount.toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{s.academicYear}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400" onClick={() => openAssignDialog(s)}>
                            <Users className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Assign</span>
                          </Button>
                        </TableCell>
                        {(canEdit || canDelete) && (
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {canEdit && <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>}
                              {canDelete && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
                                      <AlertDialogDescription>Delete the {s.feeCategoryName} structure for {s.className}? This cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(s.id)} disabled={deleting} className="bg-red-600 hover:bg-red-700">{deleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Structure Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Fee Structure</DialogTitle>
            <DialogDescription>Define fee amount for a category and class</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Fee Category *</Label>
              <Select value={addForm.feeCategoryId} onValueChange={v => setAddForm(p => ({ ...p, feeCategoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.filter(c => c.status === 'active').map(c => <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Class *</Label>
                <Select value={addForm.classId} onValueChange={v => setAddForm(p => ({ ...p, classId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Amount (₹) *</Label>
                <Input type="number" min="0" value={addForm.amount} onChange={e => setAddForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Academic Year *</Label>
              <Input value={addForm.academicYear} onChange={e => setAddForm(p => ({ ...p, academicYear: e.target.value }))} placeholder="2024-2025" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAdd} disabled={adding || !addForm.feeCategoryId || !addForm.classId || !addForm.amount || !addForm.academicYear}>{adding ? 'Adding...' : 'Add Structure'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign to Students Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Assign <span className="text-emerald-600">{assignStruct?.feeCategoryName}</span> to Students</DialogTitle>
            <DialogDescription>
              {assignStruct?.className} — {assignStruct?.academicYear} · ₹{assignStruct?.amount?.toLocaleString()}/student
            </DialogDescription>
          </DialogHeader>
          {assignLoading ? (
            <div className="py-8 flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" /></div>
          ) : assignData && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">{assignData.totalStudents} students</span>
                <span className="text-emerald-600 font-medium">{selectedStudents.size} selected</span>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={selectAll}>
                    {selectedStudents.size === assignData.students.filter(s => !s.isPaid).length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={selectTransport}>
                    <Bus className="h-3 w-3" /> Transport Only
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-9 h-9" value={searchStudent} onChange={e => setSearchStudent(e.target.value)} />
              </div>
              <div className="border rounded-lg max-h-72 overflow-y-auto">
                {assignData.students.filter(s => !debouncedSearch || s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(debouncedSearch.toLowerCase())).length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-sm">No students found</div>
                ) : (
                  assignData.students
                    .filter(s => !debouncedSearch || s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || s.rollNumber.toLowerCase().includes(debouncedSearch.toLowerCase()))
                    .map(student => (
                    <div
                      key={student.id}
                      className={cn('flex items-center gap-3 px-3 py-2.5 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50', selectedStudents.has(student.id) && 'bg-emerald-50 dark:bg-emerald-900/20')}
                      onClick={() => { if (!student.isPaid) toggleStudent(student.id); }}
                    >
                      <Checkbox checked={selectedStudents.has(student.id)} disabled={student.isPaid} className={selectedStudents.has(student.id) ? 'data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600' : ''} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{student.name}</span>
                          <span className="text-xs text-muted-foreground">#{student.rollNumber}</span>
                          {student.hasTransport && <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0"><Bus className="h-2.5 w-2.5 mr-0.5" />Transport</Badge>}
                        </div>
                      </div>
                      {student.isPaid && <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 border-0 shrink-0">Paid ✓</Badge>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAssignSave} disabled={assignSaving || assignLoading}>
              {assignSaving ? 'Saving...' : `Save (${selectedStudents.size} students)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Structure Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Amount</DialogTitle>
            <DialogDescription>{editItem?.feeCategoryName} — {editItem?.className}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label>Amount (₹)</Label>
            <Input type="number" min="0" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
