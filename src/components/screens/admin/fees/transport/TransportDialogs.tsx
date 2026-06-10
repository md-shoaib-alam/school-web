"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  const [showCustomPickup, setShowCustomPickup] = useState(false);
  const [customPickupName, setCustomPickupName] = useState("");
  const [customPickupFee, setCustomPickupFee] = useState("");

  const selectedRoute = routes.find((r: any) => r.id === assignmentData.routeId);
  const routeStops = selectedRoute ? (() => {
    try {
      return typeof selectedRoute.stops === "string" ? JSON.parse(selectedRoute.stops) : (selectedRoute.stops || []);
    } catch (e) {
      return [];
    }
  })() : [];

  // Reset custom pickup fields when dialog toggles or route changes
  useEffect(() => {
    setShowCustomPickup(false);
    setCustomPickupName("");
    setCustomPickupFee("");
  }, [assignOpen, assignmentData.routeId]);

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
              <Label>Select Route *</Label>
              <Select value={assignmentData.routeId} onValueChange={v => setAssignmentData((prev: any) => ({...prev, routeId: v, pickupPoint: ''}))}>
                <SelectTrigger><SelectValue placeholder="Select route..." /></SelectTrigger>
                <SelectContent>
                  {routes.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name} (Base: ₹{r.fee})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {assignmentData.routeId && (
              <div className="space-y-2">
                <Label>Select Pickup Point *</Label>
                {!showCustomPickup ? (
                  <Select
                    value={assignmentData.pickupPoint || ""}
                    onValueChange={(v) => {
                      if (v === "__new__") {
                        setShowCustomPickup(true);
                        setAssignmentData((prev: any) => ({ ...prev, pickupPoint: "" }));
                      } else {
                        setAssignmentData((prev: any) => ({ ...prev, pickupPoint: v }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose pickup point..." />
                    </SelectTrigger>
                    <SelectContent>
                      {routeStops.map((stop: any, idx: number) => (
                        <SelectItem key={idx} value={stop.name}>
                          {stop.name} (₹{stop.fee})
                        </SelectItem>
                      ))}
                      <SelectItem value="__new__" className="text-emerald-600 font-semibold focus:text-emerald-700">
                        + Create New Pickup Point...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-3 p-3 rounded-lg border bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="space-y-1">
                      <Label className="text-xs">New Pickup Point Name *</Label>
                      <Input
                        placeholder="e.g. Sector 5 Crossing"
                        value={customPickupName}
                        onChange={(e) => {
                          setCustomPickupName(e.target.value);
                          setAssignmentData((prev: any) => ({ ...prev, pickupPoint: e.target.value }));
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Pickup Fee (₹) *</Label>
                      <Input
                        type="number"
                        placeholder={`Route base is ₹${selectedRoute?.fee}`}
                        value={customPickupFee}
                        onChange={(e) => {
                          setCustomPickupFee(e.target.value);
                          setAssignmentData((prev: any) => ({ ...prev, newPickupPointFee: Number(e.target.value) }));
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs p-0 h-auto"
                      onClick={() => {
                        setShowCustomPickup(false);
                        setCustomPickupName("");
                        setCustomPickupFee("");
                        setAssignmentData((prev: any) => {
                          const { newPickupPointFee, ...rest } = prev;
                          return { ...rest, pickupPoint: "" };
                        });
                      }}
                    >
                      Select existing pickup point
                    </Button>
                  </div>
                )}
              </div>
            )}

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
            <Button onClick={onAssignSubmit} disabled={assigning || !assignmentData.studentId || !assignmentData.routeId || !assignmentData.pickupPoint}>
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
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Route Name *</Label>
              <Input placeholder="e.g. North Sector Loop" value={routeData.name} onChange={e => setRouteData((prev: any) => ({...prev, name: e.target.value}))} />
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

            {/* Route Stops / Pickup Points Edit Section */}
            <div className="space-y-2 border-t pt-4 mt-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Route Pickup Points</Label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {(routeData.stops || []).map((stop: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-md border text-xs bg-zinc-50/50">
                    <span className="font-semibold truncate">{stop.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-emerald-600">₹{stop.fee}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 font-bold px-1"
                        onClick={() => {
                          const updated = (routeData.stops || []).filter((_: any, i: number) => i !== idx);
                          setRouteData((prev: any) => ({ ...prev, stops: updated }));
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline input to add stop inside dialog */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px]">Stop Name</Label>
                  <Input
                    id="dialog-stop-name"
                    placeholder="Stop name"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-[10px]">Fee (₹)</Label>
                  <Input
                    id="dialog-stop-fee"
                    type="number"
                    placeholder="Fee"
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs bg-zinc-800 hover:bg-zinc-900 text-white"
                  onClick={() => {
                    const nameInput = document.getElementById("dialog-stop-name") as HTMLInputElement;
                    const feeInput = document.getElementById("dialog-stop-fee") as HTMLInputElement;
                    if (nameInput && feeInput && nameInput.value.trim() && feeInput.value.trim()) {
                      const updated = [...(routeData.stops || []), { name: nameInput.value.trim(), fee: Number(feeInput.value) }];
                      setRouteData((prev: any) => ({ ...prev, stops: updated }));
                      nameInput.value = "";
                      feeInput.value = "";
                    } else {
                      toast.error("Please enter stop name and fee");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onRouteOpenChange(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600" onClick={onRouteSubmit} disabled={addingRoute || !routeData.name}>
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
