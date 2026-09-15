"use client";

import { useReducer } from "react";
import Image from "next/image";
import { 
  useTenants, 
  useRestoreTenant, 
  usePermanentDeleteTenant 
} from "@/lib/graphql/hooks";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Hero Banner - Recycle Bin */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-100 dark:border-sky-950/40 bg-gradient-to-r from-sky-50/80 via-blue-50/50 to-sky-100/70 dark:from-sky-950/30 dark:via-blue-950/20 dark:to-sky-900/30 px-4 sm:px-6 py-3.5 sm:py-4 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="max-w-xl flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recycle Bin
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Schools slated for disposal. Data is fully retrievable for 28 days following deletion.
            </p>

            {/* Search Input inside Banner */}
            <div className="relative mt-2.5 sm:mt-3 max-w-xs sm:max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search deleted schools..."
                className="pl-9 h-8 sm:h-9 bg-white/95 dark:bg-zinc-900/95 border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-2xs text-xs sm:text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500"
                value={search}
                onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
              />
            </div>
          </div>

          {/* Right Side 4:3 Cropped/Compact Image */}
          <div className="relative h-16 sm:h-20 md:h-24 aspect-[4/3] shrink-0 overflow-hidden self-end sm:self-center">
            <Image
              src="/assets/deltedtop.png"
              alt="Recycle Bin"
              fill
              priority
              className="object-contain scale-110"
              sizes="(max-width: 640px) 110px, (max-width: 768px) 140px, 160px"
            />
          </div>
        </div>
      </div>

      {/* Main Content Card: Deletion Queue */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-5 sm:p-6 pb-5 flex items-center gap-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="size-10 sm:size-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Trash2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              Deletion Queue
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              List of schools that have been deleted and are in retention period.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/75 dark:bg-zinc-900/60 border-b border-slate-100 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3.5 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  School Details
                </TableHead>
                <TableHead className="py-3.5 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Deletion Event
                </TableHead>
                <TableHead className="py-3.5 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Retention Status
                </TableHead>
                <TableHead className="py-3.5 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Reclamation Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span className="text-sm">Loading removal list…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="size-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400">
                        <Building2 className="size-6 opacity-40" />
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">Bin is empty</p>
                      <p className="text-xs text-slate-400">No schools are currently slated for disposal.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant: any) => {
                  const deletedDate = toSafeDate(tenant.deletedAt || tenant.updatedAt);
                  const daysLeft = calculateDaysLeft(tenant.deletedAt || tenant.updatedAt);
                  const isUrgent = daysLeft <= 7;
                  const estimatedExpiryDate = addDays(deletedDate, 28);

                  return (
                    <TableRow
                      key={tenant.id}
                      className="border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* School Details */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-zinc-700/60 shrink-0">
                            <Building2 className="size-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                              {tenant.name}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              Slug: {tenant.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Deletion Event */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                          <Calendar className="size-4 text-slate-400 shrink-0" />
                          <span>
                            {tenant.deletedAt
                              ? format(deletedDate, "MMM d, yyyy HH:mm")
                              : "Unknown"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Retention Status */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              isUrgent
                                ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50"
                            }`}
                          >
                            <Clock className="size-3.5 shrink-0" />
                            {daysLeft} days left
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-normal whitespace-nowrap">
                            (Est. {format(estimatedExpiryDate, "MMM d, yyyy")})
                          </span>
                        </div>
                      </TableCell>

                      {/* Reclamation Actions */}
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-emerald-300 hover:border-emerald-400 dark:border-emerald-700/80 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                            onClick={() => {
                              dispatch({ type: "SET_SELECTED_TENANT", payload: tenant });
                              dispatch({ type: "SET_RESTORE_DIALOG_OPEN", payload: true });
                            }}
                          >
                            <RotateCcw className="size-3.5" />
                            Restore School
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-red-200 hover:border-red-300 dark:border-red-900/60 bg-red-50/60 hover:bg-red-100/80 text-red-600 dark:text-red-400 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                            onClick={() => {
                              dispatch({ type: "SET_SELECTED_TENANT", payload: tenant });
                              dispatch({ type: "SET_PURGE_DIALOG_OPEN", payload: true });
                            }}
                          >
                            <Trash2 className="size-3.5" />
                            Permanently Delete
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
      </div>

      {/* Restore Confirmation */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={(open) => dispatch({ type: "SET_RESTORE_DIALOG_OPEN", payload: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate this school?</AlertDialogTitle>
            <AlertDialogDescription>
              This reactivates {selectedTenant?.name} and restores access for all of its users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleRestore(); }}
              disabled={isRestoring}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isRestoring ? "Restoring..." : "Reactivate School"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard Delete Confirmation */}
      <AlertDialog open={purgeDialogOpen} onOpenChange={(open) => dispatch({ type: "SET_PURGE_DIALOG_OPEN", payload: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Permanently delete this school?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>This permanently deletes {selectedTenant?.name} and all associated data:</p>
                <ul className="list-disc list-inside text-sm ml-2">
                  <li>Subscriptions and transaction records</li>
                  <li>User accounts</li>
                  <li>Gradebooks, attendance, and uploaded assets</li>
                </ul>
                <p className="font-bold mt-4 text-destructive">This cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPurging}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handlePurge(); }}
              disabled={isPurging}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPurging ? "Deleting..." : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
