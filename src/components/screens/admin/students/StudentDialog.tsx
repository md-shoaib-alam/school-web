"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Bus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { StudentInfo, ClassInfo, StudentFormData } from "./types";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  classes: ClassInfo[];
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

  // Fetch transport routes for the dropdown (min data)
  const { data: routes = [] } = useQuery({
    queryKey: ['transport-routes-min'],
    enabled: open,
    queryFn: async () => {
      const res = await apiFetch('/api/transport-routes?mode=min');
      return res.json();
    }
  });

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
            <Label htmlFor="name">Full Name</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="rollNumber">Roll Number</Label>
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
              <Label htmlFor="classId">Class</Label>
              <Select
                value={formData.classId}
                onValueChange={(v) =>
                  setFormData({ ...formData, classId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}-{c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Input
                id="dob"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dateOfBirth: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Transport Section */}
          <div className="space-y-4 pt-2 border-t mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-emerald-600" />
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
                    onValueChange={(v) => setFormData({ ...formData, routeId: v })}
                  >
                    <SelectTrigger id="routeId">
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} (₹{r.fee})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pickupPoint">Pickup Point *</Label>
                  <Input
                    id="pickupPoint"
                    value={formData.pickupPoint}
                    onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                    placeholder="e.g., Park Street Stop"
                  />
                </div>
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
