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
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0 border overflow-hidden">
              <img src={tenant.logo || "/test.webp"} alt={tenant.name} className="size-full object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{tenant.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="size-3" />
                {tenant.slug}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onView}>
                <Eye className="size-4 mr-2" />
                Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageData}>
                <Database className="size-4 mr-2" />
                Manage Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddAdmin(tenant)}>
                <ShieldCheck className="size-4 mr-2" />
                Create Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onToggleStatus}>
                {tenant.status === "active" ? (
                  <>
                    <Ban className="size-4 mr-2" />
                    Suspend
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <TenantPlanBadge plan={tenant.plan} />
          <TenantStatusBadge status={tenant.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-border">
            <GraduationCap className="size-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.studentCount}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Students
            </p>
          </div>
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-border">
            <Users className="size-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.teacherCount}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Teachers
            </p>
          </div>
          <div className="text-center py-2 px-1 rounded-xl bg-muted/40 border border-border">
            <UserCheck className="size-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm font-bold leading-tight">
              {tenant.parentCount}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Parents
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg"
              onClick={onView}
            >
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 rounded-lg"
              onClick={onManageData}
            >
              Live Data
            </Button>
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full h-9 rounded-lg gap-2"
            onClick={() => onAddAdmin(tenant)}
          >
            <ShieldCheck className="size-4" />
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
          <div className="size-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
            <Building2 className="size-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="font-semibold text-lg">No schools found</h3>
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
