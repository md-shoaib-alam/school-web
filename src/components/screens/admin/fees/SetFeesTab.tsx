"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Layers, CircleDollarSign, Plus } from 'lucide-react';
import { goeyToast as toast } from 'goey-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useFeeCategories, useFeeStructures, useCreateFeeStructure, useFeeAssignment } from '@/hooks/use-fees';
import { useDebounce } from '@/hooks/use-debounce';
import type { FeeStructure, FeeCategory, ClassOption } from './types';

// Sub-components
import { FeeStructuresTable } from './structures/FeeStructuresTable';
import { AddFeeStructureDialog } from './structures/AddFeeStructureDialog';
import { EditFeeStructureDialog } from './structures/EditFeeStructureDialog';
import { AssignFeesDialog } from './structures/AssignFeesDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  const { data: minCategories = [] } = useFeeCategories('min');
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
    } catch { /* handled by mutation */ }
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
    } catch { toast.error('Error updating'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/fee-structures?id=${id}`);
      toast.success('Fee structure deleted!');
      queryClient.invalidateQueries({ queryKey: ['fee-structures'] });
    } catch { toast.error('Error deleting'); }
    setDeleting(false);
  };

  // Assign to Students logic
  const { data: assignData, isLoading: assignLoading } = useFeeAssignment(
    assignStruct?.classId || '',
    assignStruct?.feeCategoryId || '',
    assignStruct?.academicYear || ''
  );

  const openAssignDialog = (s: FeeStructure) => {
    setAssignStruct(s);
    setAssignOpen(true);
    setSelectedStudents(new Set<string>());
    setSearchStudent('');
  };

  useEffect(() => {
    if (assignData?.students) {
      queueMicrotask(() => {
        setSelectedStudents(new Set<string>(assignData.students.filter((st: any) => st.isAssigned).map((st: any) => st.id)));
      });
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
    const all = assignData.students.filter((s: any) => !s.isPaid);
    const allIds = new Set<string>(all.map((s: any) => s.id));
    if (selectedStudents.size === allIds.size) setSelectedStudents(new Set<string>());
    else setSelectedStudents(allIds);
  };

  const selectTransport = () => {
    if (!assignData) return;
    const transportStudents = assignData.students.filter((s: any) => s.hasTransport && !s.isPaid);
    if (transportStudents.length === 0) { toast.info('No transport students in this class'); return; }
    setSelectedStudents(new Set(transportStudents.map((s: any) => s.id)));
  };

  const handleAssignSave = async () => {
    if (!assignStruct || !assignData) return;
    const currentlyAssigned = new Set(assignData.students.filter((s: any) => s.isAssigned).map((s: any) => s.id));
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
        }));
      }
      if (toRemove.length > 0) {
        promises.push(api.post('/fee-assign', {
          classId: assignStruct.classId,
          feeCategoryId: assignStruct.feeCategoryId,
          studentIds: toRemove,
          academicYear: assignStruct.academicYear,
          action: 'remove'
        }));
      }
      await Promise.all(promises);
      toast.success('Assignment updated!');
      queryClient.invalidateQueries({ queryKey: ['fee-assign'] });
      setAssignOpen(false);
    } catch { toast.error('Error saving assignment'); }
    setAssignSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Tag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Layers className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Structures</p>
              <p className="text-2xl font-bold">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <CircleDollarSign className="size-5" />
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
              <Plus className="size-4 mr-2" />Add Structure
            </Button>
          )}
        </div>
      </div>

      <FeeStructuresTable 
        loading={loading}
        filtered={filtered}
        canEdit={canEdit}
        canDelete={canDelete}
        onAssign={openAssignDialog}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <AddFeeStructureDialog 
        open={addOpen}
        onOpenChange={setAddOpen}
        form={addForm}
        setForm={setAddForm}
        minCategories={minCategories}
        classes={classes}
        onAdd={handleAdd}
        adding={adding}
      />

      <EditFeeStructureDialog 
        open={editOpen}
        onOpenChange={setEditOpen}
        item={editItem}
        amount={editAmount}
        setAmount={setEditAmount}
        onSave={handleEditSave}
        saving={saving}
      />

      <AssignFeesDialog 
        open={assignOpen}
        onOpenChange={setAssignOpen}
        struct={assignStruct}
        loading={assignLoading}
        data={assignData}
        selectedIds={selectedStudents}
        onToggle={toggleStudent}
        onSelectAll={selectAll}
        onSelectTransport={selectTransport}
        search={searchStudent}
        setSearch={setSearchStudent}
        onSave={handleAssignSave}
        saving={assignSaving}
        debouncedSearch={debouncedSearch}
      />
    </div>
  );
}
