"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassSelect } from "@/components/ui/class-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { StudentInfo, ClassInfo, StudentFormData } from "./types";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  classes?: ClassInfo[];
  formData: StudentFormData;
  setFormData: (data: StudentFormData) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function StudentDialog({
  open,
  onOpenChange,
  mode,
  classes,
  formData,
  setFormData,
  submitting,
  onSubmit,
}: StudentDialogProps) {
  const isCreate = mode === "create";

  const [showCustomPickup, setShowCustomPickup] = useState(false);
  const [customPickupName, setCustomPickupName] = useState("");
  const [customPickupFee, setCustomPickupFee] = useState("");

  // Fetch transport routes for the dropdown (with stops info)
  const { data: routes = [] } = useQuery({
    queryKey: ['transport-routes-full'],
    enabled: open,
    queryFn: async () => {
      const res = await apiFetch('/api/transport-routes');
      return res.json();
    }
  });

  // Reset custom pickup when route or dialog changes
  useEffect(() => {
    if (!open) {
      setShowCustomPickup(false);
      setCustomPickupName("");
      setCustomPickupFee("");
    }
  }, [open]);

  useEffect(() => {
    setShowCustomPickup(false);
    setCustomPickupName("");
    setCustomPickupFee("");
  }, [formData.routeId]);

  const selectedRoute = routes.find((r: any) => r.id === formData.routeId);
  const routeStops = selectedRoute
    ? (typeof selectedRoute.stops === "string" ? JSON.parse(selectedRoute.stops) : (selectedRoute.stops || []))
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add New Student" : "Edit Student"}</DialogTitle>
          <DialogDescription>
            {isCreate 
              ? "Fill in the student details below" 
              : "Update the student details below"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@school.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rollNumber">Roll Number <span className="text-red-500">*</span></Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rollNumber: e.target.value,
                  })
                }
                placeholder="001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="classId">Class <span className="text-red-500">*</span></Label>
              <ClassSelect
                value={formData.classId}
                onValueChange={(v) =>
                  setFormData({ ...formData, classId: v })
                }
                placeholder="Select class"
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) =>
                  setFormData({ ...formData, gender: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 234 567"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <DatePicker
                date={formData.dateOfBirth && !isNaN(new Date(formData.dateOfBirth).getTime()) ? new Date(formData.dateOfBirth) : undefined}
                onChange={(date) => {
                  const formatted = date ? date.toISOString().split('T')[0] : '';
                  setFormData({ ...formData, dateOfBirth: formatted });
                }}
                placeholder="Pick date of birth"
                className="w-full h-10 border-zinc-200 dark:border-zinc-800"
              />
            </div>
          </div>

          {/* Transport Section */}
          <div className="space-y-4 pt-2 border-t mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="size-4 text-emerald-600" />
                <Label htmlFor="transport" className="text-sm font-semibold">Transport Service</Label>
              </div>
              <Switch 
                id="transport" 
                checked={formData.transportEnabled} 
                onCheckedChange={(checked) => setFormData({ ...formData, transportEnabled: checked })}
              />
            </div>

            {formData.transportEnabled && (
              <div className="animate-in slide-in-from-top-2 duration-200 space-y-4 pl-6 border-l-2 border-emerald-100">
                <div className="grid gap-2">
                  <Label htmlFor="routeId">Route *</Label>
                  <Select
                    value={formData.routeId}
                    onValueChange={(v) => setFormData({ ...formData, routeId: v, pickupPoint: "" })}
                  >
                    <SelectTrigger id="routeId">
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.routeId && (
                  <div className="grid gap-2">
                    <Label htmlFor="pickupPoint">Pickup Point *</Label>
                    {!showCustomPickup ? (
                      <Select
                        value={formData.pickupPoint || ""}
                        onValueChange={(v) => {
                          if (v === "__new__") {
                            setShowCustomPickup(true);
                            setFormData({ ...formData, pickupPoint: "" });
                          } else {
                            setFormData({ ...formData, pickupPoint: v });
                          }
                        }}
                      >
                        <SelectTrigger id="pickupPoint">
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
                              setFormData({ ...formData, pickupPoint: e.target.value });
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Pickup Fee (₹) *</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 1200"
                            value={customPickupFee}
                            onChange={(e) => {
                              setCustomPickupFee(e.target.value);
                              setFormData({ ...formData, newPickupPointFee: Number(e.target.value) });
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
                            const { newPickupPointFee, ...rest } = formData;
                            setFormData({ ...rest, pickupPoint: "" });
                          }}
                        >
                          Select existing pickup point
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={onSubmit}
            disabled={
              submitting ||
              !formData.name ||
              !formData.email ||
              !formData.classId ||
              !formData.rollNumber ||
              (formData.transportEnabled && (!formData.routeId || !formData.pickupPoint))
            }
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {isCreate ? "Adding..." : "Updating..."}
              </>
            ) : (
              isCreate ? "Add Student" : "Update Student"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
