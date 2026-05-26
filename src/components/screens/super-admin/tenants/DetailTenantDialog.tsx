import React, { memo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Edit,
} from "lucide-react";
import { Tenant, planColors, statusColors } from "./types";
import { SCHOOL_PLANS } from "@/lib/billing-constants";
import { format } from "date-fns";

interface DetailTenantDialogProps {
  detailOpen: boolean;
  onDetailOpenChange: (open: boolean) => void;
  viewingTenant: Tenant | null;
  onEditClick: (tenant: Tenant) => void;
}

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
  const planMeta = SCHOOL_PLANS.find(p => p.id === plan);
  const displayName = planMeta?.name || plan;
  
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} border text-[10px] uppercase tracking-wider py-0.5 px-2 font-semibold`}
    >
      <Crown className="size-3 mr-1" />
      {displayName}
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
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | null | undefined;
  }) => {
    return (
      <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="text-muted-foreground mt-0.5">
          <Icon className="size-4" />
        </div>
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
    icon: Icon,
    label,
    current,
    max,
    color,
    isCurrency = false,
  }: {
    icon: React.ComponentType<{ className?: string }>;
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
            <Icon className="size-4" />
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

export function DetailTenantDialog({
  detailOpen,
  onDetailOpenChange,
  viewingTenant,
  onEditClick,
}: DetailTenantDialogProps) {
  return (
    <Dialog open={detailOpen} onOpenChange={onDetailOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {viewingTenant && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center overflow-hidden relative">
                  <Image src={viewingTenant.logo || "/test.webp"} alt={viewingTenant.name} fill sizes="48px" className="object-cover" unoptimized />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {viewingTenant.name}
                  </DialogTitle>

                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs">
                      @{viewingTenant.slug}
                    </span>
                    <PlanBadge plan={viewingTenant.plan} />
                    <StatusBadge status={viewingTenant.status} />
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={viewingTenant.email}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Phone"
                    value={viewingTenant.phone}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Website"
                    value={viewingTenant.website}
                  />
                  <InfoItem
                    icon={MapPin}
                    label="Address"
                    value={viewingTenant.address}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Usage Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <UsageStat
                    icon={GraduationCap}
                    label="Students"
                    current={viewingTenant.studentCount}
                    max={viewingTenant.maxStudents}
                    color="bg-teal-100"
                  />
                  <UsageStat
                    icon={Users}
                    label="Teachers"
                    current={viewingTenant.teacherCount}
                    max={viewingTenant.maxTeachers}
                    color="bg-blue-100"
                  />
                  <UsageStat
                    icon={UserCheck}
                    label="Parents"
                    current={viewingTenant.parentCount}
                    max={viewingTenant.maxParents}
                    color="bg-emerald-100"
                  />
                  <UsageStat
                    icon={Building2}
                    label="Classes"
                    current={viewingTenant._count.classes}
                    max={viewingTenant.maxClasses}
                    color="bg-amber-100"
                  />
                  <UsageStat
                    icon={CreditCard}
                    label="Subscriptions"
                    current={viewingTenant.activeSubscriptions}
                    max={null}
                    color="bg-purple-100"
                  />
                  <UsageStat
                    icon={Crown}
                    label="Revenue"
                    current={viewingTenant.totalRevenue}
                    max={null}
                    color="bg-amber-100"
                    isCurrency
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Important Dates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoItem
                    icon={Calendar}
                    label="Created"
                    value={formatDateSafe(viewingTenant.createdAt)}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Start"
                    value={formatDateSafe(viewingTenant.startDate)}
                  />
                  <InfoItem
                    icon={Calendar}
                    label="End"
                    value={formatDateSafe(viewingTenant.endDate)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onDetailOpenChange(false)}
              >
                Close
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => {
                  onDetailOpenChange(false);
                  onEditClick(viewingTenant);
                }}
              >
                <Edit className="size-4 mr-2" />
                Edit School
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
