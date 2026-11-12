"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Camera, Lock, User, Phone, ShieldCheck } from "lucide-react";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

export interface TeacherEditFields {
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  nationality: string;
  religion: string;
  panNumber: string;
  aadhaarNumber: string;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initials: string;
  editName: string;
  setEditName: (v: string) => void;
  editPhone: string;
  setEditPhone: (v: string) => void;
  editAddress: string;
  setEditAddress: (v: string) => void;
  editAvatar: string;
  setEditAvatar: (v: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
  saving?: boolean;
  role?: string;
  email?: string;
  teacherFields?: TeacherEditFields;
  setTeacherFields?: (v: TeacherEditFields) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  initials,
  editName,
  setEditName,
  editPhone,
  setEditPhone,
  editAddress,
  setEditAddress,
  editAvatar,
  setEditAvatar,
  onFileChange,
  onSave,
  saving,
  role,
  email,
  teacherFields,
  setTeacherFields,
}: EditProfileDialogProps) {
  const isTeacher = (role === "teacher" || role === "staff" || role === "student") && !!teacherFields && !!setTeacherFields;
  const isStudent = role === "student";
  const tf = teacherFields as TeacherEditFields;
  const setTf = (patch: Partial<TeacherEditFields>) => setTeacherFields?.({ ...tf, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={(isTeacher ? "sm:max-w-[640px]" : "sm:max-w-[480px]") + " p-6 rounded-3xl border shadow-2xl bg-white dark:bg-[#09090b] max-h-[92vh] overflow-y-auto"}>
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-black tracking-tight">Edit Profile Details</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isTeacher
              ? "Update your personal record. Email and phone numbers are managed by the school admin."
              : "Modify your personal verified details. Changes reflect instantly."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-5 mt-2">
          <div className="flex flex-col items-center gap-3 p-4 bg-muted border rounded-2xl">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profile Photo</Label>

            <div className="relative group">
              <Avatar className="size-20 rounded-2xl border-2 border-emerald-500/20 shadow-lg">
                <AvatarImage src={editAvatar} className="object-cover" />
                <AvatarFallback className="text-2xl font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <Camera className="size-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5 w-full text-center">
              <span className="text-[10px] text-muted-foreground font-semibold">Or choose a premium profile preset</span>
              <div className="flex items-center justify-center gap-2 mt-1">
                {PRESET_AVATARS.map((avatarUrl) => (
                  <button
                    key={avatarUrl}
                    type="button"
                    onClick={() => setEditAvatar(avatarUrl)}
                    className={"size-8 rounded-lg overflow-hidden border-2 transition-all " + (
                      editAvatar === avatarUrl
                        ? "border-emerald-500 scale-110 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    <img src={avatarUrl} alt="Preset Avatar" className="size-full object-cover animate-in fade-in" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-xs font-bold text-muted-foreground">Full Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your full name"
                className="rounded-xl h-10 font-medium"
              />
            </div>

            {isTeacher ? (
              <>
                <div className="rounded-2xl border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <User className="size-3.5 text-emerald-600" />
                    Personal Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Date of Birth</Label>
                      <DatePicker
                        date={tf.dateOfBirth && !isNaN(new Date(tf.dateOfBirth).getTime()) ? new Date(tf.dateOfBirth) : undefined}
                        onChange={(d) => setTf({ dateOfBirth: d ? d.toISOString().split("T")[0] : "" })}
                        placeholder="Pick date of birth"
                        className="w-full h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Gender</Label>
                      <Select value={tf.gender || undefined} onValueChange={(v) => setTf({ gender: v })}>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Blood Group</Label>
                      <Select value={tf.bloodGroup || undefined} onValueChange={(v) => setTf({ bloodGroup: v })}>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Marital Status</Label>
                      <Select value={tf.maritalStatus || undefined} onValueChange={(v) => setTf({ maritalStatus: v })}>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Nationality</Label>
                      <Input
                        value={tf.nationality}
                        onChange={(e) => setTf({ nationality: e.target.value })}
                        placeholder="e.g. Indian"
                        className="rounded-xl h-10 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Religion</Label>
                      <Select value={tf.religion || undefined} onValueChange={(v) => setTf({ religion: v })}>
                        <SelectTrigger className="h-10 rounded-xl">
                          <SelectValue placeholder="Select religion" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Jewish", "Other"].map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Phone className="size-3.5 text-emerald-600" />
                    Contact Information
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                      <Lock className="size-3" />
                      Admin managed
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Email Address</Label>
                      <Input value={email || ""} disabled readOnly className="rounded-xl h-10 font-medium opacity-70 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Mobile Number</Label>
                      <Input value={editPhone || ""} disabled readOnly className="rounded-xl h-10 font-medium opacity-70 cursor-not-allowed" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    To change your email or phone number, contact the school admin office.
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    Statutory Details
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {!isStudent && (
                      <div className="space-y-1">
                        <Label className="text-xs font-bold text-muted-foreground">PAN Number</Label>
                        <Input
                          value={tf.panNumber}
                          onChange={(e) => setTf({ panNumber: e.target.value.toUpperCase() })}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                          className="rounded-xl h-10 font-medium font-mono"
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-muted-foreground">Aadhaar Number</Label>
                      <Input
                        value={tf.aadhaarNumber}
                        onChange={(e) => setTf({ aadhaarNumber: e.target.value.replace(/[^0-9]/g, "").slice(0, 12) })}
                        placeholder="12-digit number"
                        inputMode="numeric"
                        className="rounded-xl h-10 font-medium font-mono"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-xs font-bold text-muted-foreground">Mobile Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rounded-xl h-10 font-medium"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="edit-address" className="text-xs font-bold text-muted-foreground">Residential Address</Label>
              <Textarea
                id="edit-address"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Enter residential address"
                className="rounded-xl min-h-[70px] resize-none font-medium text-xs leading-normal"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold text-xs hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}