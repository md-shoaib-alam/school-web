"use client";

import { useReducer, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from "sonner";

// Sub-components
import { RoutesAndVehiclesView } from './transport/RoutesAndVehiclesView';
import { StudentAssignmentsView } from './transport/StudentAssignmentsView';
import { TransportDialogs } from './transport/TransportDialogs';

type State = {
  activeTab: 'routes' | 'assignments';
  assignDialogOpen: boolean;
  addRouteOpen: boolean;
  addVehicleOpen: boolean;
  assignmentData: { studentId: string; routeId: string; classId: string; startDate: string };
  routeData: { name: string; fee: string; vehicleId: string };
  vehicleData: { number: string; type: string; capacity: string; status: string };
};

type Action =
  | { type: 'SET_ACTIVE_TAB'; payload: 'routes' | 'assignments' }
  | { type: 'SET_ASSIGN_DIALOG'; payload: boolean }
  | { type: 'SET_ROUTE_DIALOG'; payload: boolean }
  | { type: 'SET_VEHICLE_DIALOG'; payload: boolean }
  | { type: 'SET_ASSIGNMENT_DATA'; payload: Partial<State['assignmentData']> }
  | { type: 'SET_ROUTE_DATA'; payload: Partial<State['routeData']> }
  | { type: 'SET_VEHICLE_DATA'; payload: Partial<State['vehicleData']> }
  | { type: 'RESET_ASSIGNMENT' }
  | { type: 'RESET_ROUTE' }
  | { type: 'RESET_VEHICLE' };

const initialAssignmentData = { studentId: '', routeId: '', classId: '', startDate: new Date().toISOString().split('T')[0] };
const initialRouteData = { name: '', fee: '', vehicleId: '' };
const initialVehicleData = { number: '', type: 'bus', capacity: '40', status: 'active' };

const initialState: State = {
  activeTab: 'routes',
  assignDialogOpen: false,
  addRouteOpen: false,
  addVehicleOpen: false,
  assignmentData: initialAssignmentData,
  routeData: initialRouteData,
  vehicleData: initialVehicleData,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_ASSIGN_DIALOG':
      return { ...state, assignDialogOpen: action.payload };
    case 'SET_ROUTE_DIALOG':
      return { ...state, addRouteOpen: action.payload };
    case 'SET_VEHICLE_DIALOG':
      return { ...state, addVehicleOpen: action.payload };
    case 'SET_ASSIGNMENT_DATA':
      return { ...state, assignmentData: { ...state.assignmentData, ...action.payload } };
    case 'SET_ROUTE_DATA':
      return { ...state, routeData: { ...state.routeData, ...action.payload } };
    case 'SET_VEHICLE_DATA':
      return { ...state, vehicleData: { ...state.vehicleData, ...action.payload } };
    case 'RESET_ASSIGNMENT':
      return { ...state, assignmentData: initialAssignmentData, assignDialogOpen: false };
    case 'RESET_ROUTE':
      return { ...state, routeData: initialRouteData, addRouteOpen: false };
    case 'RESET_VEHICLE':
      return { ...state, vehicleData: initialVehicleData, addVehicleOpen: false };
    default:
      return state;
  }
}

export function TransportFeeTab() {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    activeTab,
    assignDialogOpen,
    addRouteOpen,
    addVehicleOpen,
    assignmentData,
    routeData,
    vehicleData,
  } = state;

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
      dispatch({ type: 'RESET_ASSIGNMENT' });
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
      dispatch({ type: 'RESET_ROUTE' });
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
      dispatch({ type: 'RESET_VEHICLE' });
    },
    onError: () => toast.error('Error adding vehicle')
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button variant={activeTab === 'routes' ? 'default' : 'ghost'} size="sm" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'routes' })} className="h-8">Routes & Vehicles</Button>
        <Button variant={activeTab === 'assignments' ? 'default' : 'ghost'} size="sm" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'assignments' })} className="h-8">Student Assignments</Button>
      </div>

      {activeTab === 'routes' ? (
        <RoutesAndVehiclesView 
          loadingRoutes={loadingRoutes}
          routes={routes}
          onAddRoute={() => dispatch({ type: 'SET_ROUTE_DIALOG', payload: true })}
          vehicles={vehicles}
          onAddVehicle={() => dispatch({ type: 'SET_VEHICLE_DIALOG', payload: true })}
        />
      ) : (
        <StudentAssignmentsView 
          loadingAssignments={loadingAssignments}
          assignments={assignments}
          onAssignClick={() => dispatch({ type: 'SET_ASSIGN_DIALOG', payload: true })}
          onDelete={(id) => deleteMutation.mutate(id)}
          deletingId={deleteMutation.variables as string}
          isDeleting={deleteMutation.isPending}
        />
      )}

      <TransportDialogs 
        assignOpen={assignDialogOpen}
        onAssignOpenChange={(open) => dispatch({ type: 'SET_ASSIGN_DIALOG', payload: open })}
        assignmentData={assignmentData}
        setAssignmentData={(data: any) => {
            if (typeof data === 'function') {
                dispatch({ type: 'SET_ASSIGNMENT_DATA', payload: data(assignmentData) });
            } else {
                dispatch({ type: 'SET_ASSIGNMENT_DATA', payload: data });
            }
        }}
        classes={classes}
        students={students}
        routes={routes}
        onAssignSubmit={() => assignMutation.mutate(assignmentData)}
        assigning={assignMutation.isPending}

        routeOpen={addRouteOpen}
        onRouteOpenChange={(open) => dispatch({ type: 'SET_ROUTE_DIALOG', payload: open })}
        routeData={routeData}
        setRouteData={(data: any) => {
            if (typeof data === 'function') {
                dispatch({ type: 'SET_ROUTE_DATA', payload: data(routeData) });
            } else {
                dispatch({ type: 'SET_ROUTE_DATA', payload: data });
            }
        }}
        vehicles={vehicles}
        onRouteSubmit={() => addRouteMutation.mutate({ ...routeData, vehicleId: routeData.vehicleId === 'none' ? undefined : routeData.vehicleId })}
        addingRoute={addRouteMutation.isPending}

        vehicleOpen={addVehicleOpen}
        onVehicleOpenChange={(open) => dispatch({ type: 'SET_VEHICLE_DIALOG', payload: open })}
        vehicleData={vehicleData}
        setVehicleData={(data: any) => {
            if (typeof data === 'function') {
                dispatch({ type: 'SET_VEHICLE_DATA', payload: data(vehicleData) });
            } else {
                dispatch({ type: 'SET_VEHICLE_DATA', payload: data });
            }
        }}
        onVehicleSubmit={() => addVehicleMutation.mutate(vehicleData)}
        registeringVehicle={addVehicleMutation.isPending}
      />
    </div>
  );
}
