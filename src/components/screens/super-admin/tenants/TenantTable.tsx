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
    <div className="bg-card rounded-xl p-4 border border-border hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Circular Emblem, Title, Domain, More Menu */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/90 dark:border-slate-700 overflow-hidden shadow-2xs">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="size-full object-cover" />
              ) : (
                <Building2 className="size-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug truncate" title={tenant.name}>
                {tenant.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-normal">
                @{tenant.slug.includes(".") ? tenant.slug : `${tenant.slug}.edu.in`}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer text-xs"
              >
                •••
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl text-xs">
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
        <div className="flex items-center gap-1.5 mt-2.5">
          <TenantPlanBadge plan={tenant.plan} />
          <TenantStatusBadge status={tenant.status} />
        </div>

        {/* Stats Row: Students, Teachers, Parents */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight">
                {tenant.studentCount ? Number(tenant.studentCount).toLocaleString() : 0}
              </p>
              <p className="text-[10px] text-muted-foreground font-normal truncate">
                Students
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <GraduationCap className="size-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight">
                {tenant.teacherCount ? Number(tenant.teacherCount).toLocaleString() : 0}
              </p>
              <p className="text-[10px] text-muted-foreground font-normal truncate">
                Teachers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <UserCheck className="size-3.5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground leading-tight">
                {tenant.parentCount ? Number(tenant.parentCount).toLocaleString() : 0}
              </p>
              <p className="text-[10px] text-muted-foreground font-normal truncate">
                Parents
              </p>
            </div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="truncate">Capacity</span>
            <span className="font-semibold text-foreground text-[10px] shrink-0">
              {tenant.studentCount || 0} / {tenant.maxStudents || 1000}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                (tenant.studentCount / (tenant.maxStudents || 1000)) > 0.9
                  ? "bg-rose-500"
                  : (tenant.studentCount / (tenant.maxStudents || 1000)) > 0.7
                  ? "bg-amber-500"
                  : "bg-blue-600"
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, ((tenant.studentCount || 0) / (tenant.maxStudents || 1000)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Card Footer: Domain Link & Quick Actions */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <a
          href={`https://${tenant.slug.includes(".") ? tenant.slug : `${tenant.slug}.edu.in`}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 truncate max-w-[130px] sm:max-w-[150px]"
        >
          <Globe className="size-3 shrink-0" />
          <span className="truncate">{tenant.slug.includes(".") ? tenant.slug : `${tenant.slug}.edu.in`}</span>
        </a>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] rounded-lg text-slate-600 dark:text-slate-400 hover:text-foreground"
            onClick={onView}
          >
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px] rounded-lg border-border text-foreground hover:bg-muted font-medium"
            onClick={onManageData}
          >
            Live Data
          </Button>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[220px] rounded-xl" />
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
          <h3 className="font-semibold text-base text-foreground">No schools found</h3>
          <p className="text-muted-foreground max-w-xs mx-auto text-xs">
            Try adjusting your filters or search query to find the school you are looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "grid") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            className="pt-3 border-t border-border"
          />
        )}
      </div>
    );
  }

  const commonClasses = "text-xs font-semibold text-slate-500 dark:text-slate-400 py-3.5";
  const cellClasses = "py-3 text-xs font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-transparent border-b border-slate-200/80 dark:border-slate-800">
              <TableHead className="w-12 text-xs font-semibold text-slate-500 dark:text-slate-400 py-3.5 pl-5">#</TableHead>
              <TableHead className={commonClasses}>School Name</TableHead>
              <TableHead className={commonClasses}>Plan</TableHead>
              <TableHead className={commonClasses}>Students</TableHead>
              <TableHead className={commonClasses}>Status</TableHead>
              <TableHead className={commonClasses}>Revenue</TableHead>
              <TableHead className={`${commonClasses} text-right pr-4`}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant, idx) => (
              <TableRow
                key={tenant.id}
                className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* # */}
                <TableCell className="w-12 py-3 pl-5 text-xs font-semibold text-slate-400">
                  {(currentPage - 1) * 25 + idx + 1}
                </TableCell>

                <TableCell className={cellClasses}>
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center overflow-hidden border shrink-0">
                      <img src={tenant.logo || "/test.webp"} alt={tenant.name} className="size-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{tenant.name}</p>
                      <p className="text-[11px] text-muted-foreground">@{tenant.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cellClasses}>
                  <TenantPlanBadge plan={tenant.plan} />
                </TableCell>
                <TableCell className={cellClasses}>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">{tenant.studentCount} / {tenant.maxStudents}</p>
                    <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, (tenant.studentCount / tenant.maxStudents) * 100)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className={cellClasses}>
                  <TenantStatusBadge status={tenant.status} />
                </TableCell>
                <TableCell className={cellClasses}>
                  <span className="font-semibold text-xs text-foreground">
                    ₹{tenant.totalRevenue.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer text-xs"
                      >
                        •••
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 text-xs rounded-xl">
                      <DropdownMenuItem onClick={() => onView(tenant)} className="text-xs">
                        <Eye className="size-3.5 mr-2" /> Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageData(tenant)} className="text-xs">
                        <Database className="size-3.5 mr-2" /> Manage Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddAdmin(tenant)} className="text-xs">
                        <ShieldCheck className="size-3.5 mr-2" /> Create Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(tenant)} className="text-xs">
                        <Edit className="size-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleStatus(tenant)} className="text-xs">
                        {tenant.status === "active" ? (
                          <>
                            <Ban className="size-3.5 mr-2" /> Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5 mr-2" /> Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive text-xs" onClick={() => onDelete(tenant)}>
                        <Trash2 className="size-3.5 mr-2" /> Delete
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
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <DataTablePagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            summary={`Showing ${tenants.length} schools`}
          />
        </div>
      )}
    </div>
  );
}
