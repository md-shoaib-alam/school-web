import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Building2, 
  GraduationCap, 
  Users, 
  UserCheck, 
  School, 
  DollarSign,
  IndianRupee
} from "lucide-react";
import { TenantInfo, planColors, statusColors } from "./types";

interface DetailHeaderProps {
  tenant: TenantInfo | undefined;
  tenantName: string;
  tenantSlug: string;
  tenantPlan: string;
  onBack: () => void;
}

interface MiniStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  isCurrency?: boolean;
}

function MiniStat({
  icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  isCurrency,
}: MiniStatProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden bg-white dark:bg-gray-800">
      <CardContent className="p-4 flex items-center gap-4 relative">
        <div className={`h-11 w-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black truncate flex items-center">
              {isCurrency && <IndianRupee className="h-3.5 w-3.5 mr-0.5" />}
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {sub && <span className="text-[10px] font-bold text-muted-foreground">{sub}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DetailHeader({
  tenant,
  tenantName,
  tenantSlug,
  tenantPlan,
  onBack,
}: DetailHeaderProps) {
  const statusCfg = statusColors[tenant?.status || ""] || statusColors.inactive;
  const planCfg = planColors[tenant?.plan || ""] || planColors.basic;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-4 h-9 font-bold transition-all"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Schools
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-100 dark:shadow-none">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight truncate leading-tight">
              {tenant?.name || tenantName}
            </h1>
            <p className="text-xs font-black text-rose-600 dark:text-rose-400 mt-0.5 tracking-wider uppercase">
              @{tenant?.slug || tenantSlug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`${planCfg.bg} ${planCfg.text} ${planCfg.border} border-2 capitalize font-black text-[10px] px-3 py-1 rounded-full shadow-sm`}
          >
            {tenant?.plan || tenantPlan} Plan
          </Badge>
          <Badge
            variant="outline"
            className={`${statusCfg.bg} ${statusCfg.text} border-2 border-transparent capitalize font-black text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${statusCfg.text.replace('text-', 'bg-')}`} />
            {tenant?.status || "unknown"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MiniStat
          icon={<GraduationCap className="h-5 w-5" />}
          label="Students"
          value={tenant?.studentCount ?? 0}
          sub={tenant?.maxStudents ? `/${tenant.maxStudents}` : undefined}
          iconBg="bg-rose-50 dark:bg-rose-900/30"
          iconColor="text-rose-600"
        />
        <MiniStat
          icon={<Users className="h-5 w-5" />}
          label="Teachers"
          value={tenant?.teacherCount ?? 0}
          sub={tenant?.maxTeachers ? `/${tenant.maxTeachers}` : undefined}
          iconBg="bg-blue-50 dark:bg-blue-900/30"
          iconColor="text-blue-600"
        />
        <MiniStat
          icon={<UserCheck className="h-5 w-5" />}
          label="Parents"
          value={tenant?.parentCount ?? 0}
          sub={tenant?.maxParents ? `/${tenant.maxParents}` : undefined}
          iconBg="bg-emerald-50 dark:bg-emerald-900/30"
          iconColor="text-emerald-600"
        />
        <MiniStat
          icon={<School className="h-5 w-5" />}
          label="Classes"
          value={tenant?._count?.classes ?? 0}
          sub={tenant?.maxClasses ? `/${tenant.maxClasses}` : undefined}
          iconBg="bg-purple-50 dark:bg-purple-900/30"
          iconColor="text-purple-600"
        />
        <MiniStat
          icon={<DollarSign className="h-5 w-5" />}
          label="Revenue"
          value={tenant?.totalRevenue ?? 0}
          isCurrency
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          iconColor="text-amber-600"
        />
      </div>
    </div>
  );
}
