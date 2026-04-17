"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCircle, Shield, KeyRound, Eye, EyeOff } from "lucide-react";
import { StaffFormData, CustomRole, StaffMember } from "./types";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StaffMember | null;
  formData: StaffFormData;
  setFormData: (data: StaffFormData) => void;
  roles: CustomRole[];
  submitting: boolean;
  onSubmit: () => void;
}

export function StaffDialog({
  open,
  onOpenChange,
  member,
  formData,
  setFormData,
  roles,
  submitting,
  onSubmit,
}: StaffDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <UserCircle className="h-5 w-5 text-emerald-600" />
            {member ? "Edit Staff Member" : "Add New Staff"}
          </DialogTitle>
          <DialogDescription>
            {member
              ? "Update the profile and permissions for this staff member."
              : "Invite a new member to the administrative team."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                disabled={!!member}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="role">Assigned Role *</Label>
              <Button 
                variant="link" 
                className="h-auto p-0 text-[10px] text-emerald-600"
                onClick={() => setFormData({ ...formData, customRoleId: "" })}
              >
                Clear / No Role
              </Button>
            </div>
            <Select
              value={formData.customRoleId}
              onValueChange={(v) => setFormData({ ...formData, customRoleId: v })}
            >
              <SelectTrigger className="shadow-none">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-gray-400" />
                    Standard / No Role
                  </div>
                </SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: r.color }}
                      />
                      {r.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!member && (
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="block pb-1">Account Status</Label>
              <div className="flex items-center space-x-2 h-10 px-3 border rounded-md bg-gray-50/50 dark:bg-gray-950">
                <Checkbox
                  id="status"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: !!checked })
                  }
                />
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Active Account
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              member ? "Update Member" : "Create Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
