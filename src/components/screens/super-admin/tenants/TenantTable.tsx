import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Globe,
  MoreVertical,
  Eye,
  Database,
  ShieldCheck,
  Edit,
  Ban,
  CheckCircle2,
  Trash2,
  GraduationCap,
  Users,
  UserCheck,
  Crown,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tenant, ViewMode, planColors, statusColors } from "./types";

// --- Helper Components ---

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

const TenantCard = memo(function TenantCard({
  tenant,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onManageData,
  onAddAdmin,
}: {
  tenant: Tenant;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onManageData?: () => void;
  onAddAdmin: (tenant: Tenant) => void;
}) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-teal-100/50 dark:border-teal-900/20">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/40 dark:to-teal-900/40 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-800/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base truncate">{tenant.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {tenant.slug}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-teal-50 dark:hover:bg-teal-950/50"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageData}>
                <Database className="h-4 w-4 mr-2" />
                Manage Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddAdmin(tenant)}>
                <ShieldCheck className="h-4 w-4 mr-2 text-indigo-600" />
                Create Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleStatus}>
                {tenant.status === "active" ? (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <PlanBadge plan={tenant.plan} />
          <StatusBadge status={tenant.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-muted-foreground/5">
            <GraduationCap className="h-4 w-4 mx-auto text-teal-500 mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.studentCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">
              Students
            </p>
          </div>
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-muted-foreground/5">
            <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.teacherCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">
              Teachers
            </p>
          </div>
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-muted-foreground/5">
            <UserCheck className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.parentCount}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-tight">
              Parents
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30"
              onClick={onView}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              onClick={onManageData}
            >
              Live Data
            </Button>
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-9 rounded-lg gap-2 shadow-sm shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98]"
            size="sm"
            onClick={() => onAddAdmin(tenant)}
          >
            <ShieldCheck className="h-4 w-4" />
            Add School Admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// --- Main Table Component ---

interface TenantTableProps {
  tenants: Tenant[];
  loading: boolean;
  viewMode: ViewMode;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onToggleStatus: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  onManageData: (tenant: Tenant) => void;
  onAddAdmin: (tenant: Tenant) => void;
}

export function TenantTable({
  tenants,
  loading,
  viewMode,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  onManageData,
  onAddAdmin,
}: TenantTableProps) {
  if (loading && tenants.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-[320px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <Card className="py-20 text-center border-dashed border-2">
        <CardContent className="space-y-3">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
            <Building2 className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-bold text-lg">No schools found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Try adjusting your filters or search query to find the school you are looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onView={() => onView(tenant)}
              onEdit={() => onEdit(tenant)}
              onToggleStatus={() => onToggleStatus(tenant)}
              onDelete={() => onDelete(tenant)}
              onManageData={() => onManageData(tenant)}
              onAddAdmin={onAddAdmin}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-teal-100/50 dark:border-teal-900/20">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">School Name</TableHead>
              <TableHead className="font-bold">Plan</TableHead>
              <TableHead className="font-bold">Students</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Revenue</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id} className="hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-teal-50 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center font-bold">
                      {tenant.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{tenant.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">@{tenant.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <PlanBadge plan={tenant.plan} />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs font-bold">{tenant.studentCount} / {tenant.maxStudents}</p>
                    <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-500" 
                        style={{ width: `${Math.min(100, (tenant.studentCount / tenant.maxStudents) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={tenant.status} />
                </TableCell>
                <TableCell>
                  <span className="font-bold text-sm text-emerald-600">
                    ${tenant.totalRevenue.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onView(tenant)}>
                        <Eye className="h-4 w-4 mr-2" /> Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageData(tenant)}>
                        <Database className="h-4 w-4 mr-2" /> Manage Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddAdmin(tenant)}>
                        <ShieldCheck className="h-4 w-4 mr-2 text-indigo-600" /> Create Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(tenant)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleStatus(tenant)}>
                        {tenant.status === "active" ? (
                          <>
                            <Ban className="h-4 w-4 mr-2" /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete(tenant)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Showing {tenants.length} schools
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-xs font-bold">{currentPage}</span>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs text-muted-foreground">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
