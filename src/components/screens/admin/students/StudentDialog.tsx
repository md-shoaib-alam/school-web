"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
import {
  Loader2,
  Bus,
  X,
  User,
  Camera,
  GraduationCap,
  RotateCcw,
  Plus,
  Droplet,
  Info,
  Sparkles,
  Phone,
  Mail,
  Contact,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { ClassInfo, StudentFormData } from "./types";

import { toSquareDataUrl } from "@/lib/image-utils";

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

/** A numbered section card — icon tile, title, and a step badge on the right. */
function FormSection({
  step,
  icon: Icon,
  title,
  children,
}: {
  step: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-2.5 pb-3 border-b">
        <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
          <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs font-mono font-bold text-emerald-600/70 dark:text-emerald-400/70">
          {step}
        </span>
      </div>
      <div className="pt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Segmented control used for Gender (Male / Female / Other). */
function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border bg-muted p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "px-3.5 h-8 rounded-lg text-xs font-semibold transition-all",
            value === o.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Small pill shown on auto-generated read-only fields. */
function AutoBadge() {
  return (
    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
      <Sparkles className="size-3" />
      AUTO
    </span>
  );
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

  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2MB");
      return;
    }
    try {
      setFormData({ ...formData, avatar: await toSquareDataUrl(file) });
      toast.success("Photo attached — save to apply");
    } catch {
      toast.error("Could not read that image file");
    }
  };

  // Keep a snapshot of the initial form data when opened to support Reset button
  const [initialSnapshot, setInitialSnapshot] = useState<StudentFormData>(formData);

  useEffect(() => {
    if (open) {
      setInitialSnapshot({ ...formData });
      setShowCustomPickup(false);
      setCustomPickupName("");
      setCustomPickupFee("");
    }
  }, [open]);

  // Fetch transport routes for the dropdown (with stops info)
  const { data: routesData } = useQuery({
    queryKey: ["transport-routes-min"],
    enabled: open,
    queryFn: async () => {
      try {
        const res = await apiFetch("/api/transport-routes?mode=min");
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Failed to fetch transport routes:", err);
        return [];
      }
    },
  });

  const routes = Array.isArray(routesData) ? routesData : [];

  useEffect(() => {
    setShowCustomPickup(false);
    setCustomPickupName("");
    setCustomPickupFee("");
  }, [formData.routeId]);

  const selectedRoute = routes.find((r: any) => r?.id === formData.routeId);
  const routeStops = selectedRoute
    ? (typeof selectedRoute.stops === "string" ? JSON.parse(selectedRoute.stops) : (selectedRoute.stops || []))
    : [];

  const handleReset = () => {
    if (isCreate) {
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        phone: "",
        rollNumber: "",
        classId: "",
        gender: "male",
        dateOfBirth: "",
        bloodGroup: "",
        house: "",
        transportEnabled: false,
        routeId: "",
        pickupPoint: "",
      });
    } else {
      setFormData({ ...initialSnapshot });
    }
    setShowCustomPickup(false);
    setCustomPickupName("");
    setCustomPickupFee("");
    toast.info("Form reset to initial values");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full sm:w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden border  bg-card shadow-2xl rounded-2xl max-h-[92vh] flex flex-col focus:outline-none"
        data-lenis-prevent
        showCloseButton={false}
      >
        {/* Top Header Section with mint gradient aura and table.avif illustration */}
        <div className="relative px-6 sm:px-8 pt-6 pb-5 border-b  bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/20 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-zinc-900 shrink-0 overflow-hidden">
          
          {/* Close button at top right */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent dark:hover:text-muted-foreground transition-colors z-20"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          <div className="flex items-center justify-between gap-6 pr-8">
            <div className="space-y-1 z-10 max-w-lg">
              <p className="text-[11px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                {isCreate ? "ADD NEW STUDENT" : "EDIT STUDENT"}
              </p>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {isCreate ? "Add New Student" : "Edit Student Profile"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isCreate
                  ? "Fill in the details below. A unique School ID (e.g. STU2026xxxx) will be generated automatically for login."
                  : "Update the student information below and save your changes."}
              </DialogDescription>
            </div>

            {/* Top Right Decorative Illustration Image (table.avif) */}
            <div className="hidden sm:block relative w-36 h-24 shrink-0 -mr-2 select-none pointer-events-none">
              <Image
                src="/assets/admin/table.avif"
                alt="Student ID card graphic"
                fill
                className="object-contain drop-shadow-sm opacity-95"
                priority
              />
            </div>
          </div>
        </div>

        {/* Form Boundary: Isolates browser autofill strictly within this dialog */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          autoComplete="on"
        >
          {/* Scrollable Form Body with Section Cards */}
          <div
            className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-5 overscroll-contain touch-pan-y"
            data-lenis-prevent
          >
            {/* ── 01 Student profile ── */}
            <FormSection step="01" icon={User} title="Student profile">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <input ref={photoRef} type="file" accept="image/png,image/jpeg" onChange={handlePhoto} className="hidden" />
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="group size-28 shrink-0 rounded-2xl border-2 border-dashed border-border hover:border-emerald-500/60 bg-muted/30 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer overflow-hidden"
                >
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="" className="size-full object-cover" />
                  ) : (
                    <>
                      <Camera className="size-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                      <span className="text-xs font-semibold text-foreground">Upload photo</span>
                      <span className="text-[10px] text-muted-foreground">JPG or PNG</span>
                    </>
                  )}
                </button>

                <div className="flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">School Login ID</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        value={formData.username || (isCreate ? "Auto-generated" : "")}
                        disabled={isCreate}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="Auto-generated"
                        className="pl-9 pr-16 h-10 text-xs rounded-xl bg-muted  font-mono"
                      />
                      <AutoBadge />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    A square photo is cropped automatically. Leave the ID blank to let the system generate it.
                  </p>
                </div>
              </div>
            </FormSection>

            {/* ── 02 Personal details ── */}
            <FormSection step="02" icon={Contact} title="Personal details">
              <div className="space-y-1.5">
                <Label htmlFor="std_name" className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="std_name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="pl-9 h-10 text-xs rounded-xl bg-muted  focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Date of birth</Label>
                  <DatePicker
                    date={formData.dateOfBirth && !isNaN(new Date(formData.dateOfBirth).getTime()) ? new Date(formData.dateOfBirth) : undefined}
                    onChange={(date) => {
                      const formatted = date ? date.toISOString().split("T")[0] : "";
                      setFormData({ ...formData, dateOfBirth: formatted });
                    }}
                    placeholder="Pick date of birth"
                    className="w-full h-10 text-xs rounded-xl bg-muted "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Blood group</Label>
                  <div className="relative">
                    <Select
                      value={formData.bloodGroup || ""}
                      onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                    >
                      <SelectTrigger className="h-10 text-xs rounded-xl bg-muted  pl-9">
                        <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Gender</Label>
                <Segmented
                  value={formData.gender}
                  onChange={(val) => setFormData({ ...formData, gender: val })}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]}
                />
              </div>
            </FormSection>

            {/* ── 03 Contact ── */}
            <FormSection step="03" icon={Phone} title="Contact">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="std_email" className="text-xs font-semibold text-foreground">
                    Email address <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="std_email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@example.com"
                      className="pl-9 h-10 text-xs rounded-xl bg-muted "
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="std_phone" className="text-xs font-semibold text-foreground">
                    Mobile number
                  </Label>
                  <div className="flex rounded-xl overflow-hidden border  bg-muted focus-within:ring-1 focus-within:ring-emerald-500">
                    <span className="inline-flex items-center px-2.5 text-xs text-muted-foreground bg-muted border-r  font-medium">
                      +91
                    </span>
                    <input
                      id="std_phone"
                      name="phone"
                      autoComplete="tel"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="10-digit number"
                      inputMode="numeric"
                      maxLength={10}
                      className="w-full h-10 px-3 text-xs bg-transparent focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* ── 04 Academic enrollment ── */}
            <FormSection step="04" icon={GraduationCap} title="Academic enrollment">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Class <span className="text-red-500">*</span>
                  </Label>
                  <ClassSelect
                    value={formData.classId}
                    onValueChange={(val) => setFormData({ ...formData, classId: val })}
                    placeholder="Select class"
                    className="w-full h-10 text-xs rounded-xl bg-muted "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="std_roll" className="text-xs font-semibold text-foreground">
                    Roll no. <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">#</span>
                    <Input
                      id="std_roll"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="Enter roll number"
                      className="pl-8 h-10 text-xs rounded-xl bg-muted "
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* ── 05 Transport ── */}
            <FormSection step="05" icon={Bus} title="Transport">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="transport_toggle" className="text-xs font-bold text-foreground cursor-pointer">
                    Transport Service
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Enable if this student uses school transport
                  </p>
                </div>
                <Switch
                  id="transport_toggle"
                  checked={formData.transportEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, transportEnabled: checked })}
                />
              </div>

              {!formData.transportEnabled ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs">
                  <Info className="size-4 text-emerald-600 shrink-0" />
                  <span>Transport details will be available after enabling this option.</span>
                </div>
              ) : (
                <div className="animate-in slide-in-from-top-2 duration-200 space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Route Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Route <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.routeId}
                        onValueChange={(v) => setFormData({ ...formData, routeId: v, pickupPoint: "" })}
                      >
                        <SelectTrigger className="h-10 text-xs rounded-xl bg-muted ">
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

                    {/* Pickup Point Selection */}
                    {formData.routeId && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">
                          Pickup Point <span className="text-red-500">*</span>
                        </Label>
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
                            <SelectTrigger className="h-10 text-xs rounded-xl bg-muted ">
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
                          <div className="space-y-3 p-3.5 rounded-xl border  bg-muted">
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-foreground">
                                New Pickup Point Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                placeholder="e.g. Sector 5 Crossing"
                                value={customPickupName}
                                onChange={(e) => {
                                  setCustomPickupName(e.target.value);
                                  setFormData({ ...formData, pickupPoint: e.target.value });
                                }}
                                className="h-9 text-xs rounded-lg"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] font-semibold text-foreground">
                                Pickup Fee (₹) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                placeholder="e.g. 1200"
                                value={customPickupFee}
                                onChange={(e) => {
                                  setCustomPickupFee(e.target.value);
                                  setFormData({ ...formData, newPickupPointFee: Number(e.target.value) });
                                }}
                                className="h-9 text-xs rounded-lg"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="link"
                              className="text-xs p-0 h-auto text-emerald-600 hover:text-emerald-700"
                              onClick={() => {
                                setShowCustomPickup(false);
                                setCustomPickupName("");
                                setCustomPickupFee("");
                                const { newPickupPointFee, ...rest } = formData;
                                setFormData({ ...rest, pickupPoint: "" });
                              }}
                            >
                              ← Select existing pickup point
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FormSection>
        </div>

        {/* Modal Action Footer matching the screenshot */}
        <div className="px-6 sm:px-8 py-4 bg-card border-t  flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="gap-2 text-xs font-semibold text-foreground  hover:bg-accent rounded-xl px-4 h-10"
          >
            <RotateCcw className="size-3.5 text-muted-foreground" />
            Reset
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold text-foreground  hover:bg-accent rounded-xl px-5 h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !formData.name ||
                !formData.classId ||
                !formData.rollNumber ||
                (formData.transportEnabled && (!formData.routeId || !formData.pickupPoint))
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl px-5 h-10 gap-1.5 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {isCreate ? "Adding Student..." : "Updating..."}
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {isCreate ? "Add Student" : "Update Student"}
                </>
              )}
            </Button>
          </div>
        </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
