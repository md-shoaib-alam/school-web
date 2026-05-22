"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { goeyToast as toast } from 'goey-toast';

// Sub-components
import { RoutesAndVehiclesView } from './transport/RoutesAndVehiclesView';
import { StudentAssignmentsView } from './transport/StudentAssignmentsView';
import { TransportDialogs } from './transport/TransportDialogs';

export function TransportFeeTab() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'routes' | 'assignments'>('routes');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addRouteOpen, setAddRouteOpen] = useState(false);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  // ── Queries ──
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
  const students = useMemo(() => Array.isArray(studentsData) ? studentsData : studentsData?.items || [], [studentsData]);

  // ── Mutations ──
  const assignMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/transport-assignments', { method: 'POST', body: JSON.stringify(data) });
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
      const res = await apiFetch(`/api/transport-assignments?id=${id}`, { method: 'DELETE' });
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

  const addRouteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/transport-routes', { method: 'POST', body: JSON.stringify(data) });
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

  const addVehicleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiFetch('/api/vehicles', { method: 'POST', body: JSON.stringify(data) });
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

  // ── States ──
  const [assignmentData, setAssignmentData] = useState({ studentId: '', routeId: '', classId: '', startDate: new Date().toISOString().split('T')[0] });
  const [routeData, setRouteData] = useState({ name: '', fee: '', vehicleId: '' });
  const [vehicleData, setVehicleData] = useState({ number: '', type: 'bus', capacity: '40', status: 'active' });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button variant={activeTab === 'routes' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('routes')} className="h-8">Routes & Vehicles</Button>
        <Button variant={activeTab === 'assignments' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('assignments')} className="h-8">Student Assignments</Button>
      </div>

      {activeTab === 'routes' ? (
        <RoutesAndVehiclesView 
          loadingRoutes={loadingRoutes}
          routes={routes}
          onAddRoute={() => setAddRouteOpen(true)}
          vehicles={vehicles}
          onAddVehicle={() => setAddVehicleOpen(true)}
        />
      ) : (
        <StudentAssignmentsView 
          loadingAssignments={loadingAssignments}
          assignments={assignments}
          onAssignClick={() => setAssignDialogOpen(true)}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingId={deleteMutation.variables as string}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <TransportDialogs 
        assignOpen={assignDialogOpen}
        onAssignOpenChange={setAssignDialogOpen}
        assignmentData={assignmentData}
        setAssignmentData={setAssignmentData}
        classes={classes}
        students={students}
        routes={routes}
        onAssignSubmit={() => assignMutation.mutate(assignmentData)}
        assigning={assignMutation.isPending}

        routeOpen={addRouteOpen}
        onRouteOpenChange={setAddRouteOpen}
        routeData={routeData}
        setRouteData={setRouteData}
        vehicles={vehicles}
        onRouteSubmit={() => addRouteMutation.mutate({ ...routeData, vehicleId: routeData.vehicleId === 'none' ? undefined : routeData.vehicleId })}
        addingRoute={addRouteMutation.isPending}

        vehicleOpen={addVehicleOpen}
        onVehicleOpenChange={setAddVehicleOpen}
        vehicleData={vehicleData}
        setVehicleData={setVehicleData}
        onVehicleSubmit={() => addVehicleMutation.mutate(vehicleData)}
        registeringVehicle={addVehicleMutation.isPending}
      />
    </div>
  );
}
