import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Crown,
  GraduationCap,
  Users,
  UserCheck,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Edit,
} from "lucide-react";
import { Tenant, TenantFormData, planColors, statusColors } from "./types";
import { format } from "date-fns";

// --- Helper Components ---

const formatDateSafe = (dateStr: any, formatStr: string = "MMM d, yyyy") => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, formatStr);
  } catch {
    return "N/A";
  }
};

const PlanBadge = memo(({ plan }: { plan: string }) => {
  const config = planColors[plan] || planColors.basic;
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} border text-[10px] uppercase tracking-wider py-0.5 px-2 font-semibold`}
    >
      <Crown className="h-3 w-3 mr-1" />
      {plan}
    </Badge>
  );
});

const StatusBadge = memo(({ status }: { status: string }) => {
  const config = statusColors[status] || statusColors.inactive;
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} gap-1 text-[10px] py-0.5 px-2 border-none`}
    >
      {config.icon}
      {status.toUpperCase()}
    </Badge>
  );
});

const InfoItem = memo(
  ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | null | undefined;
  }) => {
    return (
      <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="text-muted-foreground mt-0.5">{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
            {label}
          </p>
          <p className="text-sm font-medium truncate">{value || "Not set"}</p>
        </div>
      </div>
    );
  },
);

const UsageStat = memo(
  ({
    icon,
    label,
    current,
    max,
    color,
    isCurrency = false,
  }: {
    icon: React.ReactNode;
    label: string;
    current: number;
    max: number | null;
    color: string;
    isCurrency?: boolean;
  }) => {
    const [bgClass] = color.split(" ");
    const pct = max ? Math.min(100, Math.round((current / max) * 100)) : null;

    return (
      <div className={`p-3 rounded-lg ${bgClass}/30 space-y-1.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {icon}
            {label}
          </div>
          {pct !== null && (
            <span className="text-[10px] font-medium">{pct}%</span>
          )}
        </div>
        <p className="text-lg font-bold">
          {isCurrency ? `₹${current.toLocaleString()}` : current}
          {max !== null && (
            <span className="text-xs font-normal text-muted-foreground">
              /{max}
            </span>
          )}
        </p>
        {pct !== null && (
          <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct > 90
                  ? "bg-red-500"
                  : pct > 70
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    );
  },
);

// --- Main Dialogs Component ---

interface TenantDialogsProps {
  // Form Dialog
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

  // Detail Dialog
  detailOpen: boolean;
  onDetailOpenChange: (open: boolean) => void;
  viewingTenant: Tenant | null;
  onEditClick: (tenant: Tenant) => void;

  // Delete Dialog
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  deletingTenant: Tenant | null;
  onDeleteConfirm: () => void;

  // Admin Dialog
  adminOpen: boolean;
  onAdminOpenChange: (open: boolean) => void;
  targetTenant: Tenant | null;
  adminFormData: any;
  setAdminFormData: any;
  showAdminPassword: boolean;
  setShowAdminPassword: (show: boolean) => void;
  onCreateAdmin: () => void;
}

export function TenantDialogs({
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
  detailOpen,
  onDetailOpenChange,
  viewingTenant,
  onEditClick,
  deleteOpen,
  onDeleteOpenChange,
  deletingTenant,
  onDeleteConfirm,
  adminOpen,
  onAdminOpenChange,
  targetTenant,
  adminFormData,
  setAdminFormData,
  showAdminPassword,
  setShowAdminPassword,
  onCreateAdmin,
}: TenantDialogsProps) {
  return (
    <>
      {/* ── Create/Edit Dialog ── */}
      <Dialog open={formOpen} onOpenChange={onFormOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingTenant ? "Edit School" : "Create New School"}
            </DialogTitle>
            <DialogDescription>
              {editingTenant 
                ? "Update the configuration for this institution."
                : "Provision a new school instance on the platform."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">General Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">School Name *</Label>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    disabled={autoSlug}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="contact@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <Input 
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Plan & Limits */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subscription & Limits</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">Active Plan</Label>
                  <Select 
                    value={formData.plan} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, plan: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Plan</SelectItem>
                      <SelectItem value="standard">Standard Plan</SelectItem>
                      <SelectItem value="premium">Premium Plan</SelectItem>
                      <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground">System Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
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
                    <GraduationCap className="h-3 w-3" /> Max Students
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.maxStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Max Teachers
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.maxTeachers}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTeachers: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Max Parents
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.maxParents}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParents: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Max Classes
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.maxClasses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxClasses: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onFormOpenChange(false)}>Cancel</Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={onSubmit}
              disabled={submitting || !formData.name.trim() || !formData.slug.trim()}
            >
              {submitting ? "Saving..." : (editingTenant ? "Update School" : "Create School")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Details Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={onDetailOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {viewingTenant && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{viewingTenant.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs">@{viewingTenant.slug}</span>
                      <PlanBadge plan={viewingTenant.plan} />
                      <StatusBadge status={viewingTenant.status} />
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-5 py-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoItem icon={<Mail className="h-4 w-4" />} label="Email" value={viewingTenant.email} />
                    <InfoItem icon={<Phone className="h-4 w-4" />} label="Phone" value={viewingTenant.phone} />
                    <InfoItem icon={<Globe className="h-4 w-4" />} label="Website" value={viewingTenant.website} />
                    <InfoItem icon={<MapPin className="h-4 w-4" />} label="Address" value={viewingTenant.address} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Usage Statistics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <UsageStat icon={<GraduationCap className="h-4 w-4" />} label="Students" current={viewingTenant.studentCount} max={viewingTenant.maxStudents} color="bg-teal-100" />
                    <UsageStat icon={<Users className="h-4 w-4" />} label="Teachers" current={viewingTenant.teacherCount} max={viewingTenant.maxTeachers} color="bg-blue-100" />
                    <UsageStat icon={<UserCheck className="h-4 w-4" />} label="Parents" current={viewingTenant.parentCount} max={viewingTenant.maxParents} color="bg-emerald-100" />
                    <UsageStat icon={<Building2 className="h-4 w-4" />} label="Classes" current={viewingTenant._count.classes} max={viewingTenant.maxClasses} color="bg-amber-100" />
                    <UsageStat icon={<CreditCard className="h-4 w-4" />} label="Subscriptions" current={viewingTenant.activeSubscriptions} max={null} color="bg-purple-100" />
                    <UsageStat icon={<Crown className="h-4 w-4" />} label="Revenue" current={viewingTenant.totalRevenue} max={null} color="bg-amber-100" isCurrency />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Important Dates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoItem icon={<Calendar className="h-4 w-4" />} label="Created" value={formatDateSafe(viewingTenant.createdAt)} />
                    <InfoItem icon={<Calendar className="h-4 w-4" />} label="Start" value={formatDateSafe(viewingTenant.startDate)} />
                    <InfoItem icon={<Calendar className="h-4 w-4" />} label="End" value={formatDateSafe(viewingTenant.endDate)} />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => onDetailOpenChange(false)}>Close</Button>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => {
                    onDetailOpenChange(false);
                    onEditClick(viewingTenant);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit School
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={deleteOpen} onOpenChange={onDeleteOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingTenant?.name}</strong>? This will permanently remove the school and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onDeleteOpenChange(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={onDeleteConfirm}
            >
              Delete School
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Create Admin Modal ── */}
      <Dialog open={adminOpen} onOpenChange={onAdminOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Create School Admin
            </DialogTitle>
            <DialogDescription>
              Set up the administrative account for <span className="text-foreground font-semibold">{targetTenant?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Full Name</Label>
              <Input 
                placeholder="e.g. Dr. Jane Smith"
                value={adminFormData.name}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  type="email"
                  placeholder="admin@school.com"
                  className="pl-11 h-11 rounded-xl"
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Phone Number (Optional)</Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="+1 (555) 000-0000"
                  className="pl-11 h-11 rounded-xl"
                  value={adminFormData.phone}
                  onChange={(e) => setAdminFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Initial Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  className="pl-11 pr-11 h-11 rounded-xl"
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData(prev => ({ ...prev, password: e.target.value }))}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                >
                  {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onAdminOpenChange(false)}>Cancel</Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl min-w-[140px]"
              onClick={onCreateAdmin}
              disabled={submitting || !adminFormData.name || !adminFormData.email || !adminFormData.password}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
