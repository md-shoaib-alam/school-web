"use client";

import { useReducer } from "react";
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
import { format, addDays, differenceInDays } from "date-fns";
import { Input } from "@/components/ui/input";
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

type State = {
  search: string;
  currentPage: number;
  isRestoring: boolean;
  isPurging: boolean;
  selectedTenant: any;
  restoreDialogOpen: boolean;
  purgeDialogOpen: boolean;
};

type Action =
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_IS_RESTORING"; payload: boolean }
  | { type: "SET_IS_PURGING"; payload: boolean }
  | { type: "SET_SELECTED_TENANT"; payload: any }
  | { type: "SET_RESTORE_DIALOG_OPEN"; payload: boolean }
  | { type: "SET_PURGE_DIALOG_OPEN"; payload: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SEARCH":
      return { ...state, search: action.payload, currentPage: 1 };
    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_IS_RESTORING":
      return { ...state, isRestoring: action.payload };
    case "SET_IS_PURGING":
      return { ...state, isPurging: action.payload };
    case "SET_SELECTED_TENANT":
      return { ...state, selectedTenant: action.payload };
    case "SET_RESTORE_DIALOG_OPEN":
      return { ...state, restoreDialogOpen: action.payload };
    case "SET_PURGE_DIALOG_OPEN":
      return { ...state, purgeDialogOpen: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  search: "",
  currentPage: 1,
  isRestoring: false,
  isPurging: false,
  selectedTenant: null,
  restoreDialogOpen: false,
  purgeDialogOpen: false,
};

export function SuperAdminDeletedTenants() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    search,
    currentPage,
    isRestoring,
    isPurging,
    selectedTenant,
    restoreDialogOpen,
    purgeDialogOpen,
  } = state;

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
    dispatch({ type: "SET_IS_RESTORING", payload: true });
    try {
      await restoreMutation.mutateAsync(selectedTenant.id);
      dispatch({ type: "SET_RESTORE_DIALOG_OPEN", payload: false });
      refetch();
    } catch (err) {
      // Hook handles toast
    } finally {
      dispatch({ type: "SET_IS_RESTORING", payload: false });
    }
  };

  const handlePurge = async () => {
    if (!selectedTenant) return;
    dispatch({ type: "SET_IS_PURGING", payload: true });
    try {
      await purgeMutation.mutateAsync(selectedTenant.id);
      dispatch({ type: "SET_PURGE_DIALOG_OPEN", payload: false });
      refetch();
    } catch (err) {
       // Hook handles toast
    } finally {
      dispatch({ type: "SET_IS_PURGING", payload: false });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Recycle Bin</h1>
          <p className="text-muted-foreground">
            Schools slated for disposal. Data is fully retrievable for 28 days following deletion.
          </p>
        </div>
      </div>

      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 text-amber-900 dark:text-amber-100">
        <CardContent className="flex items-center gap-4 p-4">
          <AlertTriangle className="size-6 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-medium">
            Retention Policy Active: Items in the bin are automatically flushed permanently after 28 days of static existence. Automated cleansing cycles run nightly.
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input 
          placeholder="Search deleted schools..." 
          className="pl-9"
          value={search}
          onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
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
                    <TableCell colSpan={4} className="h-24 text-center">Loading removal list…</TableCell>
                  </TableRow>
                ) : tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="size-8 opacity-20" />
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
                            <div className="size-9 rounded bg-muted flex items-center justify-center text-muted-foreground">
                              <Building2 className="size-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{tenant.name}</div>
                              <div className="text-xs text-muted-foreground">Slug: {tenant.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-muted-foreground" />
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
                               <Clock className="size-3 mr-1" />
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
                                dispatch({ type: "SET_SELECTED_TENANT", payload: tenant });
                                dispatch({ type: "SET_RESTORE_DIALOG_OPEN", payload: true });
                              }}
                            >
                              <RotateCcw className="size-3.5" />
                              Restore
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                dispatch({ type: "SET_SELECTED_TENANT", payload: tenant });
                                dispatch({ type: "SET_PURGE_DIALOG_OPEN", payload: true });
                              }}
                            >
                              <Trash2 className="size-3.5" />
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
      <AlertDialog open={restoreDialogOpen} onOpenChange={(open) => dispatch({ type: "SET_RESTORE_DIALOG_OPEN", payload: open })}>
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
              {isRestoring ? "Restoring…" : "Confirm Reactivation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation */}
      <AlertDialog open={purgeDialogOpen} onOpenChange={(open) => dispatch({ type: "SET_PURGE_DIALOG_OPEN", payload: open })}>
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
              {isPurging ? "Purging Hardware Tracks…" : "Execute Data Scrub"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
