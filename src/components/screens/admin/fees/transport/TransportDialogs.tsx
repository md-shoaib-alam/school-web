"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";

interface TransportDialogsProps {
  assignOpen: boolean;
  onAssignOpenChange: (open: boolean) => void;
  assignmentData: any;
  setAssignmentData: (v: any) => void;
  classes: any[];
  students: any[];
  routes: any[];
  onAssignSubmit: () => void;
  assigning: boolean;

  routeOpen: boolean;
  onRouteOpenChange: (open: boolean) => void;
  routeData: any;
  setRouteData: (v: any) => void;
  vehicles: any[];
  onRouteSubmit: () => void;
  addingRoute: boolean;
  isEditingRoute?: boolean;

  vehicleOpen: boolean;
  onVehicleOpenChange: (open: boolean) => void;
  vehicleData: any;
  setVehicleData: (v: any) => void;
  onVehicleSubmit: () => void;
  registeringVehicle: boolean;
  isEditingVehicle?: boolean;
}

export function TransportDialogs({
  assignOpen, onAssignOpenChange, assignmentData, setAssignmentData, classes, students, routes, onAssignSubmit, assigning,
  routeOpen, onRouteOpenChange, routeData, setRouteData, vehicles, onRouteSubmit, addingRoute, isEditingRoute = false,
  vehicleOpen, onVehicleOpenChange, vehicleData, setVehicleData, onVehicleSubmit, registeringVehicle, isEditingVehicle = false,
}: TransportDialogsProps) {
  return (
    <>
      {/* Assign Student Dialog */}
      <Dialog open={assignOpen} onOpenChange={onAssignOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Transport Route</DialogTitle>
            <DialogDescription>Select a student and a transport route to begin service.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select Class *</Label>
              <Select value={assignmentData.classId} onValueChange={v => setAssignmentData((prev: any) => ({...prev, classId: v, studentId: ''}))}>
                <SelectTrigger><SelectValue placeholder="Select class first..." /></SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}-{c.section} (Grade {c.grade})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Student *</Label>
              <Select value={assignmentData.studentId} onValueChange={v => setAssignmentData((prev: any) => ({...prev, studentId: v}))} disabled={!assignmentData.classId}>
                <SelectTrigger><SelectValue placeholder={assignmentData.classId ? "Select student..." : "Pick a class first"} /></SelectTrigger>
                <SelectContent>
                  {students.reduce((acc: React.ReactNode[], s: any) => {
                    if (!assignmentData.classId || s.classId === assignmentData.classId) {
                      acc.push(<SelectItem key={s.id} value={s.id}>{s.user?.name || s.name}</SelectItem>);
                    }
                    return acc;
                  }, [])}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Route</Label>
              <Select value={assignmentData.routeId} onValueChange={v => setAssignmentData((prev: any) => ({...prev, routeId: v}))}>
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
                onChange={(d) => setAssignmentData((prev: any) => ({...prev, startDate: d ? d.toISOString().split('T')[0] : ''}))} 
                className="w-full h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onAssignOpenChange(false)}>Cancel</Button>
            <Button onClick={onAssignSubmit} disabled={assigning || !assignmentData.studentId || !assignmentData.routeId}>
              {assigning ? 'Assigning...' : 'Assign Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Route Dialog */}
      <Dialog open={routeOpen} onOpenChange={onRouteOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditingRoute ? 'Edit Transport Route' : 'Add Transport Route'}</DialogTitle>
            <DialogDescription>{isEditingRoute ? 'Modify details of this transportation route.' : 'Create a new route for school transportation.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Route Name *</Label>
              <Input placeholder="e.g. North Sector Loop" value={routeData.name} onChange={e => setRouteData((prev: any) => ({...prev, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Monthly Fee (₹) *</Label>
              <Input type="number" placeholder="e.g. 1500" value={routeData.fee} onChange={e => setRouteData((prev: any) => ({...prev, fee: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Assign Vehicle (Optional)</Label>
              <Select value={routeData.vehicleId} onValueChange={v => setRouteData((prev: any) => ({...prev, vehicleId: v}))}>
                <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Vehicle</SelectItem>
                  {vehicles.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.number} ({v.type})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onRouteOpenChange(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600" onClick={onRouteSubmit} disabled={addingRoute || !routeData.name || !routeData.fee}>
              {addingRoute ? 'Saving...' : (isEditingRoute ? 'Save Changes' : 'Add Route')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Vehicle Dialog */}
      <Dialog open={vehicleOpen} onOpenChange={onVehicleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditingVehicle ? 'Edit Vehicle' : 'Register Vehicle'}</DialogTitle>
            <DialogDescription>{isEditingVehicle ? 'Modify details of this vehicle in the fleet.' : 'Add a new vehicle to the school transport fleet.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Vehicle Number *</Label>
              <Input placeholder="e.g. DL 01 AB 1234" value={vehicleData.number} onChange={e => setVehicleData((prev: any) => ({...prev, number: e.target.value}))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={vehicleData.type} onValueChange={v => setVehicleData((prev: any) => ({...prev, type: v}))}>
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
                <Input type="number" value={vehicleData.capacity} onChange={e => setVehicleData((prev: any) => ({...prev, capacity: e.target.value}))} />
              </div>
            </div>
            {isEditingVehicle && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={vehicleData.status} onValueChange={v => setVehicleData((prev: any) => ({...prev, status: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onVehicleOpenChange(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" onClick={onVehicleSubmit} disabled={registeringVehicle || !vehicleData.number}>
              {registeringVehicle ? 'Saving...' : (isEditingVehicle ? 'Save Changes' : 'Register Vehicle')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
