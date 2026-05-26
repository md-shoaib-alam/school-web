import React from "react";
import Image from "next/image";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Tenant, TenantFormData } from "./types";
import { SCHOOL_PLANS } from "@/lib/billing-constants";

interface CreateTenantDialogProps {
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
  editingTenant: Tenant | null;
  formData: TenantFormData;
  setFormData: React.Dispatch<React.SetStateAction<TenantFormData>>;
  autoSlug: boolean;
  setAutoSlug: (auto: boolean) => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function CreateTenantDialog({
  formOpen,
  onFormOpenChange,
  editingTenant,
  formData,
  setFormData,
  autoSlug,
  setAutoSlug,
  onNameChange,
  onSubmit,
  submitting,
}: CreateTenantDialogProps) {
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // Simulated upload progress when submitting
  React.useEffect(() => {
    let interval: any;
    if (submitting) {
      setUploadProgress(0);
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return prev;
          const next = prev + Math.random() * 20;
          return next > 95 ? 95 : next;
        });
      }, 200);
    } else {
      setUploadProgress(100);
      const timer = setTimeout(() => setUploadProgress(0), 1000);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
    return () => clearInterval(interval);
  }, [submitting]);

  return (
    <Dialog open={formOpen} onOpenChange={onFormOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editingTenant ? "Edit School" : "Create New School"}
          </DialogTitle>
          <DialogDescription>
            {editingTenant
              ? "Update the configuration for this institution."
              : "Provision a new school instance on the platform."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              General Information
            </h4>

            {/* Logo Upload */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pb-2">
              <div className="relative group cursor-pointer">
                <div className="size-24 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden bg-muted/30 group-hover:bg-muted/50 transition-all relative">
                  {formData.logoFile || formData.logo ? (
                    <Image
                      src={
                        formData.logoFile
                          ? URL.createObjectURL(formData.logoFile)
                          : formData.logo
                      }
                      alt="Logo preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Image src="/test.webp" alt="Default logo placeholder" fill sizes="96px" className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" unoptimized />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                  <span className="text-white text-[10px] font-bold uppercase">
                    Upload
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Logo file size must be less than 5MB");
                          return;
                        }
                        setFormData((prev) => ({ ...prev, logoFile: file }));
                      }
                    }}
                  />
                </label>
                {(formData.logoFile || formData.logo) && (
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 size-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        logoFile: null,
                        logo: "",
                      }))
                    }
                  >
                    <XCircle className="size-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 space-y-4 w-full">
                {submitting && formData.logoFile && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      <span>Uploading Logo...</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-1.5 bg-teal-100"
                      indicatorClassName="bg-teal-500"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                      School Name *
                    </Label>
                    <Input
                      placeholder="e.g. Green Valley Academy"
                      value={formData.name}
                      onChange={(e) => onNameChange(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground flex items-center justify-between">
                      Slug (URL path) *
                      <button
                        type="button"
                        className={`text-[10px] font-bold uppercase ${autoSlug ? "text-teal-600" : "text-muted-foreground hover:text-teal-600"}`}
                        onClick={() => setAutoSlug(!autoSlug)}
                      >
                        {autoSlug ? "Auto-sync ON" : "Manual mode"}
                      </button>
                    </Label>
                    <Input
                      placeholder="green-valley-academy"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      disabled={autoSlug}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="contact@school.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                      Phone Number
                    </Label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan & Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Subscription & Limits
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">
                  Active Plan
                </Label>
                <Select
                  value={formData.plan}
                  onValueChange={(v) => {
                    const planDef = SCHOOL_PLANS.find(p => p.id === v);
                    setFormData((prev) => ({ 
                      ...prev, 
                      plan: v,
                      // Automatically set limits based on plan selection like school-subscriptions does!
                      ...(planDef ? {
                        maxStudents: planDef.limits.students,
                        maxTeachers: planDef.limits.teachers,
                        maxParents: planDef.limits.parents,
                        maxClasses: planDef.limits.classes,
                      } : {})
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_PLANS.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} Plan
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground">
                  System Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial Period</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="size-3" /> Max Students
                </Label>
                <Input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxStudents: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="size-3" /> Max Teachers
                </Label>
                <Input
                  type="number"
                  value={formData.maxTeachers}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxTeachers: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <UserCheck className="size-3" /> Max Parents
                </Label>
                <Input
                  type="number"
                  value={formData.maxParents}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxParents: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="size-3" /> Max Classes
                </Label>
                <Input
                  type="number"
                  value={formData.maxClasses}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxClasses: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onFormOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            onClick={onSubmit}
            disabled={
              submitting || !formData.name.trim() || !formData.slug.trim()
            }
          >
            {submitting
              ? "Saving..."
              : editingTenant
                ? "Update School"
                : "Create School"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
