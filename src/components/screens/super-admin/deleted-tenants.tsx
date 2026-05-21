"use client";

import { useState } from "react";
import { 
  useTenants, 
  useRestoreTenant, 
  usePermanentDeleteTenant 
} from "@/lib/graphql/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Building2, 
  RotateCcw, 
  Trash2, 
  Calendar,
  AlertTriangle,
  Clock,
  Search
} from "lucide-react";
import { format, formatDistanceToNow, addDays, differenceInDays } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const toSafeDate = (val: any): Date => {
  if (!val) return new Date();
  const date = new Date(val);
  if (!isNaN(date.getTime())) return date;
  // Attempt to parse numerical strings that new Date() might fail on natively
  const timestamp = Number(val);
  if (!isNaN(timestamp) && timestamp > 0) return new Date(timestamp);
  return new Date();
};

export function SuperAdminDeletedTenants() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);

  // Specifically fetch deleted records using the "deleted" filter key
  const { data, isLoading, refetch } = useTenants({
    status: "deleted",
    search: search || undefined,
    page: currentPage,
    limit: 50
  });

  const restoreMutation = useRestoreTenant();
  const purgeMutation = usePermanentDeleteTenant();

  const tenants = data?.tenants ?? [];

  const calculateDaysLeft = (deletedAtStr: string) => {
    if (!deletedAtStr) return 0;
    const deletedDate = toSafeDate(deletedAtStr);
    const expiryDate = addDays(deletedDate, 28);
    const days = differenceInDays(expiryDate, new Date());
    return Math.max(0, days);
  };

  const handleRestore = async () => {
    if (!selectedTenant) return;
    setIsRestoring(true);
    try {
      await restoreMutation.mutateAsync(selectedTenant.id);
      setRestoreDialogOpen(false);
      refetch();
    } catch (err) {
      // Hook handles toast
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePurge = async () => {
    if (!selectedTenant) return;
    setIsPurging(true);
    try {
      await purgeMutation.mutateAsync(selectedTenant.id);
      setPurgeDialogOpen(false);
      refetch();
    } catch (err) {
       // Hook handles toast
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>
          <p className="text-muted-foreground">
            Schools slated for disposal. Data is fully retrievable for 28 days following deletion.
          </p>
        </div>
      </div>

      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-900 dark:text-amber-100">
        <CardContent className="flex items-center gap-4 p-4">
          <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-medium">
            Retention Policy Active: Items in the bin are automatically flushed permanently after 28 days of static existence. Automated cleansing cycles run nightly.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search deleted schools..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Deletion Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>School Details</TableHead>
                  <TableHead>Deletion Event</TableHead>
                  <TableHead>Retention Status</TableHead>
                  <TableHead className="text-right">Reclamation Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">Loading removal list...</TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-8 w-8 opacity-20" />
                        <p>Bin is empty. No schools are currently slated for disposal.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant: any) => {
                    const daysLeft = calculateDaysLeft(tenant.deletedAt || tenant.updatedAt);
                    const isUrgent = daysLeft <= 7;
                    
                    return (
                      <TableRow key={tenant.id} className="group transition-colors hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded bg-muted flex items-center justify-center text-muted-foreground">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{tenant.name}</div>
                              <div className="text-xs text-muted-foreground">Slug: {tenant.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                         <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {tenant.deletedAt 
                                ? format(toSafeDate(tenant.deletedAt), "MMM d, yyyy HH:mm")
                                : "Unknown"
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <Badge 
                               variant={isUrgent ? "destructive" : "outline"}
                               className={isUrgent ? "" : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200"}
                             >
                               <Clock className="h-3 w-3 mr-1" />
                               {daysLeft} days left
                             </Badge>
                             <span className="text-xs text-muted-foreground hidden md:inline">
                               (Est. {format(addDays(toSafeDate(tenant.deletedAt || tenant.updatedAt), 28), "MMM d")})
                             </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setRestoreDialogOpen(true);
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Restore
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setPurgeDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Purge
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reinstate School?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately reactivate "{selectedTenant?.name}" and rescue all embedded data from the disposal buffer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleRestore(); }}
              disabled={isRestoring}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isRestoring ? "Restoring..." : "Confirm Reactivation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation */}
      <AlertDialog open={purgeDialogOpen} onOpenChange={setPurgeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Final Irrevocable Destruction?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-foreground/90">
                <p>Warning! This transcends logical state triggers. Execution will trigger absolute recursive data cascades, vaporizing:</p>
                <ul className="list-disc list-inside text-sm ml-2 opacity-80">
                  <li>All linked Subscriptions & Transaction Records</li>
                  <li>All User Accounts & Identity Vaults</li>
                  <li>All Gradebooks, Attendance & Assets</li>
                </ul>
                <p className="font-bold mt-4">THIS CANNOT BE UNDONE.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPurging}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handlePurge(); }}
              disabled={isPurging}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isPurging ? "Purging Hardware Tracks..." : "Execute Data Scrub"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
