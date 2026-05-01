"use client";

import { useState } from "react";
import { 
  useTenants, 
  useUpdateTenant 
} from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Settings2
} from "lucide-react";
import { format } from "date-fns";
import { goeyToast as toast } from "goey-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { SCHOOL_PLANS } from "@/lib/billing-constants";

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
      toast.success("School subscription updated");
      setIsDialogOpen(false);
      refetch();
    } catch (err: any) {
      toast.error("Failed to update subscription", { description: err.message });
    }
  };

  const getStatusBadge = (status: string, endDate: string | null) => {
    const now = new Date();
    const expiry = endDate ? new Date(endDate) : null;
    
    if (status !== "active") return <Badge variant="destructive">{status}</Badge>;
    if (expiry && expiry < now) return <Badge variant="outline" className="text-rose-500 border-rose-500">Expired</Badge>;
    return <Badge className="bg-emerald-500">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">School Subscriptions</h2>
            <p className="text-muted-foreground mt-1">Manage school-level plans, limits, and license periods.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Schools</p>
                <p className="text-2xl font-bold">{tenantsData?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                <ArrowUpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Licenses</p>
                <p className="text-2xl font-bold">
                  {tenantsData?.tenants?.filter((t: any) => t.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold">
                  {tenantsData?.tenants?.filter((t: any) => {
                    if (!t.endDate) return false;
                    const diff = new Date(t.endDate).getTime() - new Date().getTime();
                    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
                  }).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search schools..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School Name</TableHead>
              <TableHead>Current Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Student Limit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading schools...</TableCell></TableRow>
            ) : tenantsData?.tenants?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No schools found.</TableCell></TableRow>
            ) : (
              tenantsData?.tenants?.map((tenant: any) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">
                      {tenant.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(tenant.status, tenant.endDate)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {tenant.endDate ? format(new Date(tenant.endDate), "PP") : "No expiry"}
                    </div>
                  </TableCell>
                  <TableCell>{tenant.maxStudents.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(tenant)}
                      className="h-8 gap-1.5 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
                        {plan.name} Plan
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

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Updating these settings will immediately affect the school's ability to login and add data.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700">Update License</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
