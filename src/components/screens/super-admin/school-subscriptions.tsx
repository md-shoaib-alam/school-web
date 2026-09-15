"use client";

import { useState, useEffect } from "react";
import {
  useTenants,
  useUpdateTenant
} from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Building2,
  Calendar,
  CreditCard,
  Search,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpCircle,
  Settings2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { SCHOOL_PLANS } from "@/lib/billing-constants";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { StatusBadge } from "@/components/ui/status-badge";

const ITEMS_PER_PAGE = 10;

export function SuperAdminSchoolSubscriptions() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);



  const { data: tenantsData, isLoading, refetch } = useTenants({
    search: search || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const updateTenant = useUpdateTenant();

  const handleEdit = (tenant: any) => {
    setEditingTenant({
      id: tenant.id,
      name: tenant.name,
      plan: tenant.plan,
      endDate: tenant.endDate || "",
      maxStudents: tenant.maxStudents,
      maxTeachers: tenant.maxTeachers,
      maxParents: tenant.maxParents,
      maxClasses: tenant.maxClasses,
      status: tenant.status
    });
    setIsDialogOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        plan: editingTenant.plan,
        status: editingTenant.status,
        maxStudents: parseInt(editingTenant.maxStudents) || 0,
        maxTeachers: parseInt(editingTenant.maxTeachers) || 0,
        maxParents: parseInt(editingTenant.maxParents) || 0,
        maxClasses: parseInt(editingTenant.maxClasses) || 0,
        endDate: editingTenant.endDate || null
      };

      await updateTenant.mutateAsync({
        id: editingTenant.id,
        data: payload as any
      });
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error("Failed to update subscription", { description: err.message });
    }
  };

  const getStatusBadge = (status: string, endDate: string | null) => {
    const now = new Date();
    const expiry = endDate ? new Date(endDate) : null;

    if (status === "trial") return <StatusBadge tone="warning">Trial</StatusBadge>;
    if (status === "suspended") return <StatusBadge tone="negative">Suspended</StatusBadge>;

    if (status !== "active") return <StatusBadge tone="negative">{status}</StatusBadge>;

    if (expiry && expiry < now) return <StatusBadge tone="negative">Expired</StatusBadge>;

    return <StatusBadge tone="positive">Active</StatusBadge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-muted flex items-center justify-center border">
            <ShieldCheck className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">B2B School Licenses</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage school-level plans, limits, and license periods.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border rounded-xl bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Building2 className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total schools</p>
                <p className="text-2xl font-semibold">{tenantsData?.stats?.total ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-xl bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <ArrowUpCircle className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active licenses</p>
                <p className="text-2xl font-semibold">
                  {(tenantsData?.stats?.active ?? 0) + (tenantsData?.stats?.trial ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border rounded-xl bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Expiring soon</p>
                <p className="text-2xl font-semibold">
                  {tenantsData?.stats?.expiring ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border rounded-xl bg-card">
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search schools..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-medium text-muted-foreground">School Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Current Plan</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Expiry Date</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Student Limit</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tenantsData?.tenants?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No schools found.</TableCell></TableRow>
            ) : (
              tenantsData?.tenants?.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {tenant.plan}
                    </Badge>
                  </TableCell>
                  <TableCell suppressHydrationWarning>{getStatusBadge(tenant.status, tenant.endDate)}</TableCell>
                  <TableCell suppressHydrationWarning>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {tenant.endDate ? format(new Date(tenant.endDate), "PP") : "No expiry"}
                    </div>
                  </TableCell>
                  <TableCell>{tenant.maxStudents.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(tenant)}
                      className="h-8 gap-1.5"
                    >
                      <Settings2 className="size-3.5" />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && tenantsData && tenantsData.totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <DataTablePagination
              page={currentPage}
              totalPages={tenantsData.totalPages}
              onPageChange={setCurrentPage}
              summary={`Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}\u2013${Math.min(currentPage * ITEMS_PER_PAGE, tenantsData.total)} of ${tenantsData.total} entries`}
            />
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Subscription: {editingTenant?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Plan</Label>
                <Select
                  value={editingTenant?.plan}
                  onValueChange={(v) => {
                    const selectedPlan = SCHOOL_PLANS.find(p => p.id === v);
                    if (selectedPlan) {
                      setEditingTenant({
                        ...editingTenant,
                        plan: v,
                        maxStudents: selectedPlan.limits.students,
                        maxTeachers: selectedPlan.limits.teachers,
                        maxParents: selectedPlan.limits.parents,
                        maxClasses: selectedPlan.limits.classes,
                      });
                    } else {
                      setEditingTenant({...editingTenant, plan: v});
                    }
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCHOOL_PLANS.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>System Status</Label>
                <Select value={editingTenant?.status} onValueChange={(v) => setEditingTenant({...editingTenant, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="trial">Trial Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>License Expiry Date</Label>
              <DatePicker
                date={editingTenant?.endDate ? new Date(editingTenant.endDate) : undefined}
                onChange={(date) => setEditingTenant({
                  ...editingTenant,
                  endDate: date ? format(date, "yyyy-MM-dd") : ""
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxStudents}
                  onChange={(e) => setEditingTenant({...editingTenant, maxStudents: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Teachers</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxTeachers}
                  onChange={(e) => setEditingTenant({...editingTenant, maxTeachers: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Parents</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxParents}
                  onChange={(e) => setEditingTenant({...editingTenant, maxParents: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Classes</Label>
                <Input
                  type="number"
                  value={editingTenant?.maxClasses}
                  onChange={(e) => setEditingTenant({...editingTenant, maxClasses: e.target.value})}
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg border flex items-start gap-3">
              <AlertCircle className="size-5 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Updating these settings will immediately affect the school's ability to login and add data.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update License</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
