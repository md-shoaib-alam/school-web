"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Bus, MapPin, Navigation, UserPlus, Search, ShieldCheck, Map, Truck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';

export function TransportFeeTab() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'routes' | 'assignments'>('routes');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Queries
  const { data: routes = [], isLoading: loadingRoutes } = useQuery({
    queryKey: ['transport-routes'],
    queryFn: async () => {
      const res = await apiFetch('/api/transport-routes');
      return res.json();
    }
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await apiFetch('/api/vehicles');
      return res.json();
    }
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['transport-assignments'],
    queryFn: async () => {
      const res = await apiFetch('/api/transport-assignments');
      return res.json();
    }
  });

  const { data: studentsData } = useQuery({
    queryKey: ['students-min'],
    queryFn: async () => {
      const res = await apiFetch('/api/students?mode=min&limit=5000');
      return res.json();
    }
  });
  const students = studentsData?.items || [];


  // Assignment Mutation
  const assignMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/transport-assignments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to assign');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Student assigned to route successfully');
      queryClient.invalidateQueries({ queryKey: ['transport-assignments'] });
      setAssignDialogOpen(false);
    },
    onError: () => toast.error('Error assigning student')
  });

  const [assignmentData, setAssignmentData] = useState({ studentId: '', routeId: '', startDate: new Date().toISOString().split('T')[0] });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button variant={activeTab === 'routes' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('routes')} className="h-8">Routes & Vehicles</Button>
        <Button variant={activeTab === 'assignments' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('assignments')} className="h-8">Student Assignments</Button>
      </div>

      {activeTab === 'routes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Map className="h-4 w-4 text-emerald-600" />Transport Routes</CardTitle>
                <CardDescription>All active school bus routes and fees</CardDescription>
              </div>
              <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">Add Route</Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingRoutes ? (
                <div className="p-6 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No routes defined</TableCell></TableRow>
                    ) : routes.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium text-sm">{r.name}</TableCell>
                        <TableCell className="text-sm font-semibold text-emerald-600">₹{r.fee.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">{r.vehicle?.number || 'Not Assigned'}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-emerald-50 border-emerald-200">{r._count?.students || 0} Students</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-blue-600" />Vehicles</CardTitle>
                <CardDescription>Fleet status</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-8">Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicles.length === 0 ? (
                <p className="text-center py-8 text-xs text-muted-foreground">No vehicles registered</p>
              ) : vehicles.map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{v.number}</p>
                    <p className="text-[10px] text-muted-foreground">{v.type} • Cap: {v.capacity}</p>
                  </div>
                  <Badge className={v.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}>{v.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Student Transport List</CardTitle>
              <CardDescription>Students subscribed to transport services</CardDescription>
            </div>
            <Button size="sm" className="h-8 gap-1" onClick={() => setAssignDialogOpen(true)}><UserPlus className="h-3.5 w-3.5" />Assign Student</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingAssignments ? (
              <div className="p-6 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No students assigned to transport</TableCell></TableRow>
                  ) : assignments.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-sm">{a.student.user.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.student.class.name}-{a.student.class.section}</TableCell>
                      <TableCell className="text-sm">{a.route.name}</TableCell>
                      <TableCell className="text-xs">{a.startDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-8">Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Transport Route</DialogTitle>
            <DialogDescription>Select a student and a transport route to begin service.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={assignmentData.studentId} onValueChange={v => setAssignmentData({...assignmentData, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Search student..." /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.user?.name || s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Route</Label>
              <Select value={assignmentData.routeId} onValueChange={v => setAssignmentData({...assignmentData, routeId: v})}>
                <SelectTrigger><SelectValue placeholder="Select route..." /></SelectTrigger>
                <SelectContent>
                  {routes.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name} (₹{r.fee})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={assignmentData.startDate} onChange={e => setAssignmentData({...assignmentData, startDate: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => assignMutation.mutate(assignmentData)} disabled={assignMutation.isPending || !assignmentData.studentId || !assignmentData.routeId}>
              {assignMutation.isPending ? 'Assigning...' : 'Assign Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
