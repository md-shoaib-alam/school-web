import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { Tenant, ViewMode } from "./types";
import { TenantPlanBadge, TenantStatusBadge } from "./badges";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

// --- Helper Components ---

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
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Circular Emblem, Title, Domain, More Menu */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/90 dark:border-slate-700 overflow-hidden shadow-2xs">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="size-full object-cover" />
              ) : (
                <Building2 className="size-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-[15px] text-slate-900 dark:text-slate-100 leading-snug truncate" title={tenant.name}>
                {tenant.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-normal">
                @{tenant.slug.includes(".") ? tenant.slug : `${tenant.slug}.edu.in`}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 -mr-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuItem onClick={onView} className="text-xs">
                <Eye className="size-3.5 mr-2" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageData} className="text-xs">
                <Database className="size-3.5 mr-2" />
                Manage Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddAdmin(tenant)} className="text-xs">
                <ShieldCheck className="size-3.5 mr-2" />
                Create Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="text-xs">
                <Edit className="size-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleStatus} className="text-xs">
                {tenant.status === "active" ? (
                  <>
                    <Ban className="size-3.5 mr-2" />
                    Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive text-xs"
                onClick={onDelete}
              >
                <Trash2 className="size-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges: Plan & Status */}
        <div className="flex items-center gap-2 mt-3">
          <TenantPlanBadge plan={tenant.plan} />
          <TenantStatusBadge status={tenant.status} />
        </div>

        {/* Stats Row: Students, Teachers, Parents */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-0.5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {tenant.studentCount ? Number(tenant.studentCount).toLocaleString() : 0}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                Students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {tenant.teacherCount ? Number(tenant.teacherCount).toLocaleString() : 0}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                Teachers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {tenant.parentCount ? Number(tenant.parentCount).toLocaleString() : 0}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                Parents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons matching reference image */}
      <div className="flex flex-col gap-2 mt-5">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8.5 rounded-xl border-slate-200/90 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
            onClick={onView}
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8.5 rounded-xl border-slate-200/90 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors"
            onClick={onManageData}
          >
            Live Data
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-9 rounded-xl bg-blue-50/80 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-400 text-xs font-semibold gap-1.5 transition-colors border border-blue-100/60 dark:border-blue-900/40"
          onClick={() => onAddAdmin(tenant)}
        >
          <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
          Add School Admin
        </Button>
      </div>
    </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[250px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <Card className="py-20 text-center border-dashed border-2 rounded-2xl">
        <CardContent className="space-y-3">
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
            <Building2 className="size-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-lg">No schools found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-sm">
            Try adjusting your filters or search query to find the school you are looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <DataTablePagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            summary={`Page ${currentPage} of ${totalPages}`}
            className="pt-4 border-t"
          />
        )}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground">School Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Plan</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Students</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Revenue</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center overflow-hidden border">
                      <img src={tenant.logo || "/test.webp"} alt={tenant.name} className="size-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">@{tenant.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TenantPlanBadge plan={tenant.plan} />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">{tenant.studentCount} / {tenant.maxStudents}</p>
                    <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, (tenant.studentCount / tenant.maxStudents) * 100)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TenantStatusBadge status={tenant.status} />
                </TableCell>
                <TableCell>
                  <span className="font-medium text-sm">
                    ₹{tenant.totalRevenue.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onView(tenant)}>
                        <Eye className="size-4 mr-2" /> Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageData(tenant)}>
                        <Database className="size-4 mr-2" /> Manage Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddAdmin(tenant)}>
                        <ShieldCheck className="size-4 mr-2" /> Create Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(tenant)}>
                        <Edit className="size-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleStatus(tenant)}>
                        {tenant.status === "active" ? (
                          <>
                            <Ban className="size-4 mr-2" /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-4 mr-2" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(tenant)}>
                        <Trash2 className="size-4 mr-2" /> Delete
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
        <div className="px-4 py-3 border-t">
          <DataTablePagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            summary={`Showing ${tenants.length} schools`}
          />
        </div>
      )}
    </Card>
  );
}
