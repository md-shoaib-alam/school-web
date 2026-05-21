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
import { DatePicker } from '@/components/ui/date-picker';
import { parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function TransportFeeTab() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'routes' | 'assignments'>('routes');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addRouteOpen, setAddRouteOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

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

  const { data: assignmentsData, isLoading: loadingAssignments } = useQuery({
    queryKey: ['transport-assignments'],
    queryFn: async () => {
      const res = await apiFetch('/api/transport-assignments');
      return res.json();
    }
  });
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.items || [];

  const { data: classes = [] } = useQuery({
    queryKey: ['classes-min'],
    queryFn: async () => {
      const res = await apiFetch('/api/classes?mode=min');
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
  const students = useMemo(() => {
    const raw = Array.isArray(studentsData) ? studentsData : studentsData?.items || [];
    return raw;
  }, [studentsData]);


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
      queryClient.invalidateQueries({ queryKey: ['transport-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
      setAssignDialogOpen(false);
      setAssignmentData({ studentId: '', routeId: '', classId: '', startDate: new Date().toISOString().split('T')[0] });
      toast.success('Student assigned to route successfully');
    },
    onError: () => toast.error('Failed to assign student')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/transport-assignments?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
      toast.success('Assignment removed successfully');
    },
    onError: () => toast.error('Failed to remove assignment')
  });

  const [assignmentData, setAssignmentData] = useState({ studentId: '', routeId: '', classId: '', startDate: new Date().toISOString().split('T')[0] });

  // Route Mutation
  const addRouteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/transport-routes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add route');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Route added successfully');
      queryClient.invalidateQueries({ queryKey: ['transport-routes'] });
      setAddRouteOpen(false);
      setRouteData({ name: '', fee: '', vehicleId: '' });
    },
    onError: () => toast.error('Error adding route')
  });

  const [routeData, setRouteData] = useState({ name: '', fee: '', vehicleId: '' });

  // Vehicle Mutation
  const addVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/vehicles', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to add vehicle');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Vehicle added successfully');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setAddVehicleOpen(false);
      setVehicleData({ number: '', type: 'bus', capacity: '40', status: 'active' });
    },
    onError: () => toast.error('Error adding vehicle')
  });

  const [vehicleData, setVehicleData] = useState({ number: '', type: 'bus', capacity: '40', status: 'active' });

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
                <CardTitle className="text-base flex items-center gap-2"><Map className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />Transport Routes</CardTitle>
                <CardDescription>All active school bus routes and fees</CardDescription>
              </div>
              <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600" onClick={() => setAddRouteOpen(true)}>Add Route</Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingRoutes ? (
                <div className="p-6 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6 h-12">Route Name</TableHead>
                      <TableHead className="h-12">Fee</TableHead>
                      <TableHead className="h-12">Vehicle</TableHead>
                      <TableHead className="h-12">Students</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No routes defined</TableCell></TableRow>
                    ) : routes.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="pl-6 py-4 font-medium text-sm">{r.name}</TableCell>
                        <TableCell className="py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">₹{r.fee.toLocaleString()}</TableCell>
                        <TableCell className="py-4 text-xs">{r.vehicle?.number || 'Not Assigned'}</TableCell>
                        <TableCell className="py-4"><Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">{r.students?.length || 0} Students</Badge></TableCell>
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
                <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />Vehicles</CardTitle>
                <CardDescription>Fleet status</CardDescription>
              </div>
              <Button size="sm" variant="outline" className="h-8" onClick={() => setAddVehicleOpen(true)}>Add</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicles.length === 0 ? (
                <p className="text-center py-8 text-xs text-muted-foreground">No vehicles registered</p>
              ) : vehicles.map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
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
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />Student Transport List</CardTitle>
              <CardDescription>Students subscribed to transport services</CardDescription>
            </div>
            <Button size="sm" className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600" onClick={() => setAssignDialogOpen(true)}><UserPlus className="h-3.5 w-3.5" />Assign Student</Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingAssignments ? (
              <div className="p-6 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 h-12">Student</TableHead>
                    <TableHead className="h-12">Class</TableHead>
                    <TableHead className="h-12">Route</TableHead>
                    <TableHead className="h-12">Start Date</TableHead>
                    <TableHead className="text-right h-12 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No students assigned to transport</TableCell></TableRow>
                  ) : assignments.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="pl-6 py-4 font-medium text-sm">{a.student?.user?.name || a.studentName || 'Unknown Student'}</TableCell>
                      <TableCell className="py-4 text-xs text-muted-foreground">{a.student?.class?.name}-{a.student?.class?.section || 'N/A'}</TableCell>
                      <TableCell className="py-4 text-sm">{a.route?.name || 'Unknown Route'}</TableCell>
                      <TableCell className="py-4 text-xs">{a.startDate}</TableCell>
                      <TableCell className="py-4 text-right pr-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 h-8"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending && deleteMutation.variables === a.id ? 'Removing...' : 'Remove'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove transport assignment for {a.student?.user?.name || 'this student'}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteMutation.mutate(a.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
              <Label>Select Class *</Label>
              <Select value={assignmentData.classId} onValueChange={v => setAssignmentData(prev => ({...prev, classId: v, studentId: ''}))}>
                <SelectTrigger><SelectValue placeholder="Select class first..." /></SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Student *</Label>
              <Select value={assignmentData.studentId} onValueChange={v => setAssignmentData(prev => ({...prev, studentId: v}))} disabled={!assignmentData.classId}>
                <SelectTrigger><SelectValue placeholder={assignmentData.classId ? "Select student..." : "Pick a class first"} /></SelectTrigger>
                <SelectContent>
                  {students.reduce((acc: React.ReactNode[], s: any) => {
                    if (!assignmentData.classId || s.classId === assignmentData.classId) {
                      acc.push(
                        <SelectItem key={s.id} value={s.id}>
                          {s.user?.name || s.name}
                        </SelectItem>
                      );
                    }
                    return acc;
                  }, [])}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Route</Label>
              <Select value={assignmentData.routeId} onValueChange={v => setAssignmentData(prev => ({...prev, routeId: v}))}>
                <SelectTrigger><SelectValue placeholder="Select route..." /></SelectTrigger>
                <SelectContent>
                  {routes.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name} (₹{r.fee})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label className="mb-1">Start Date</Label>
              <DatePicker 
                date={assignmentData.startDate ? parseISO(assignmentData.startDate) : undefined} 
                onChange={(d) => setAssignmentData(prev => ({...prev, startDate: d ? d.toISOString().split('T')[0] : ''}))} 
                className="w-full h-10"
              />
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

      {/* Add Route Dialog */}
      <Dialog open={addRouteOpen} onOpenChange={setAddRouteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Transport Route</DialogTitle>
            <DialogDescription>Create a new route for school transportation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Route Name *</Label>
              <Input placeholder="e.g. North Sector Loop" value={routeData.name} onChange={e => setRouteData(prev => ({...prev, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Fee (₹) *</Label>
              <Input type="number" placeholder="e.g. 1500" value={routeData.fee} onChange={e => setRouteData(prev => ({...prev, fee: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Assign Vehicle (Optional)</Label>
              <Select value={routeData.vehicleId} onValueChange={v => setRouteData(prev => ({...prev, vehicleId: v}))}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Vehicle</SelectItem>
                  {vehicles.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.number} ({v.type})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRouteOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600" onClick={() => addRouteMutation.mutate({ ...routeData, vehicleId: routeData.vehicleId === 'none' ? undefined : routeData.vehicleId })} disabled={addRouteMutation.isPending || !routeData.name || !routeData.fee}>
              {addRouteMutation.isPending ? 'Adding...' : 'Add Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vehicle Dialog */}
      <Dialog open={addVehicleOpen} onOpenChange={setAddVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register Vehicle</DialogTitle>
            <DialogDescription>Add a new vehicle to the school transport fleet.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Vehicle Number *</Label>
              <Input placeholder="e.g. DL 01 AB 1234" value={vehicleData.number} onChange={e => setVehicleData(prev => ({...prev, number: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={vehicleData.type} onValueChange={v => setVehicleData(prev => ({...prev, type: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="bus">Bus</SelectItem>
                     <SelectItem value="van">Van</SelectItem>
                     <SelectItem value="mini_bus">Mini Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" value={vehicleData.capacity} onChange={e => setVehicleData(prev => ({...prev, capacity: e.target.value}))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddVehicleOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" onClick={() => addVehicleMutation.mutate(vehicleData)} disabled={addVehicleMutation.isPending || !vehicleData.number}>
              {addVehicleMutation.isPending ? 'Registering...' : 'Register Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
