import React from "react";
import Image from "next/image";
import { 
  X, 
  MapPin, 
  ExternalLink, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Crown, 
  RefreshCw, 
  Calendar, 
  Settings2, 
  ShieldCheck, 
  AlertCircle, 
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { SCHOOL_PLANS } from "@/lib/billing-constants";

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTenant: any;
  setEditingTenant: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  onCancelSubscription: () => void;
  isSubmittingAction: boolean;
  isConfirmUpdateOpen: boolean;
  setIsConfirmUpdateOpen: (open: boolean) => void;
  isConfirmCancelOpen: boolean;
  setIsConfirmCancelOpen: (open: boolean) => void;
}

export function ManageSubscriptionModal({
  isOpen,
  onOpenChange,
  editingTenant,
  setEditingTenant,
  onSave,
  onCancelSubscription,
  isSubmittingAction,
  isConfirmUpdateOpen,
  setIsConfirmUpdateOpen,
  isConfirmCancelOpen,
  setIsConfirmCancelOpen,
}: ManageSubscriptionModalProps) {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="p-0 sm:max-w-4xl md:max-w-[880px] w-[calc(100%-1.5rem)] max-h-[92vh] overflow-y-auto rounded-3xl border  shadow-2xl bg-white dark:bg-slate-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:px-6 sm:py-5 border-b ">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="size-11 sm:size-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 overflow-hidden">
                {editingTenant?.logo ? (
                  <Image
                    src={editingTenant.logo}
                    alt={editingTenant.name || "School"}
                    width={48}
                    height={48}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base">
                    {editingTenant?.name ? editingTenant.name.slice(0, 2).toUpperCase() : "SC"}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-lg font-bold text-foreground truncate">
                  Manage Subscription
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {editingTenant?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <Select
                  value={editingTenant?.status || "active"}
                  onValueChange={(v) => setEditingTenant({ ...editingTenant, status: v })}
                >
                  <SelectTrigger className="h-auto p-0 border-0 bg-transparent shadow-none font-semibold text-emerald-700 dark:text-emerald-300 capitalize text-xs focus:ring-0 gap-1 min-w-[64px] sm:min-w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial Mode</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                {editingTenant?.startDate && (
                  <span className="text-[11px] text-muted-foreground">
                    Since {format(new Date(editingTenant.startDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-full text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground hover:bg-accent"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
              {/* Left Column: School Overview, Counts, Plan */}
              <div className="space-y-3.5 sm:space-y-4">
                <div className="p-3.5 sm:p-4 rounded-2xl border  bg-muted flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-14 sm:size-16 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                      {editingTenant?.logo ? (
                        <Image
                          src={editingTenant.logo}
                          alt={editingTenant.name || "School"}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                          {editingTenant?.name ? editingTenant.name.slice(0, 2).toUpperCase() : "SC"}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm sm:text-base text-foreground truncate">
                        {editingTenant?.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground font-normal truncate">
                          /{editingTenant?.slug || "school"}
                        </span>
                        {editingTenant?.slug && (
                          <a
                            href={`https://schoolconnect.in/${editingTenant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`https://schoolconnect.in/${editingTenant.slug}`}
                            className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="size-3 shrink-0" />
                        <span>{editingTenant?.address || "Bengaluru, Karnataka"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t ">
                    <div className="bg-card border  rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xs">
                      <div className="size-6.5 sm:size-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Users className="size-3 sm:size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                          {editingTenant?.studentCount ?? 0}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Students</p>
                      </div>
                    </div>

                    <div className="bg-card border  rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xs">
                      <div className="size-6.5 sm:size-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <GraduationCap className="size-3 sm:size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                          {editingTenant?.teacherCount ?? 0}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Teachers</p>
                      </div>
                    </div>

                    <div className="bg-card border  rounded-xl p-2 sm:p-2.5 flex items-center gap-2 shadow-2xs">
                      <div className="size-6.5 sm:size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <UserCheck className="size-3 sm:size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                          {editingTenant?.parentCount ?? 0}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Parents</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-200/90 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/15 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 sm:size-11 rounded-2xl bg-amber-100/80 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Crown className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        Current Plan
                      </p>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-100/90 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-semibold text-xs capitalize">
                          {editingTenant?.plan ? `${editingTenant.plan} Plan` : "Starter Plan"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {SCHOOL_PLANS.find((p) => p.id === editingTenant?.plan)?.description?.split(".")[0] || "Basic features for small schools"}
                      </p>
                    </div>
                  </div>

                  <Select
                    value={editingTenant?.plan}
                    onValueChange={(v) => {
                      const selectedPlan = SCHOOL_PLANS.find((p) => p.id === v);
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
                        setEditingTenant({ ...editingTenant, plan: v });
                      }
                    }}
                  >
                    <SelectTrigger className="h-auto p-1 sm:h-8.5 sm:px-3 border-0 sm:border bg-transparent sm:bg-white dark:sm:bg-slate-900 sm: dark:sm: text-blue-600 dark:text-blue-400 hover:bg-transparent sm:hover:bg-blue-50/50 shrink-0 rounded-xl gap-1.5 shadow-none sm:shadow-2xs cursor-pointer [&_svg]:size-5 sm:[&_svg]:size-4 [&_svg]:text-foreground sm:[&_svg]:text-blue-600 dark:[&_svg]:text-muted-foreground">
                      <RefreshCw className="size-3 text-blue-600 dark:text-blue-400 hidden sm:inline" />
                      <span className="hidden sm:inline text-xs font-semibold">Change Plan</span>
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {SCHOOL_PLANS.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="hidden sm:block">
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">License Start Date</Label>
                      <div className="h-10 px-3 rounded-2xl border  bg-card flex items-center justify-center gap-2 text-xs font-semibold text-foreground shadow-2xs">
                        <Calendar className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-xs">
                          {editingTenant?.startDate
                            ? format(new Date(editingTenant.startDate), "MMM d, yyyy")
                            : "Oct 1, 2026"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">License Expiry Date</Label>
                      <DatePicker
                        className="w-full h-10 justify-center text-center rounded-2xl  bg-card text-foreground font-semibold shadow-2xs [&_svg]:size-4 [&_svg]:text-muted-foreground"
                        date={editingTenant?.endDate ? new Date(editingTenant.endDate) : undefined}
                        onChange={(date) =>
                          setEditingTenant({
                            ...editingTenant,
                            endDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Subscription Limits */}
              <div className="space-y-3.5 sm:space-y-4">
                <div className="p-3.5 sm:p-5 rounded-2xl border  bg-muted space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 sm:size-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Settings2 className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Subscription Limits</h4>
                      <p className="text-xs text-muted-foreground">Set maximum limits for different modules</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-2.5 rounded-xl border  bg-card">
                      <span className="text-xs font-semibold text-foreground">Max Students</span>
                      <input
                        type="number"
                        className="w-24 h-8 px-2 text-right text-xs font-bold border rounded-lg bg-background"
                        value={editingTenant?.maxStudents ?? 100}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxStudents: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border  bg-card">
                      <span className="text-xs font-semibold text-foreground">Max Teachers</span>
                      <input
                        type="number"
                        className="w-24 h-8 px-2 text-right text-xs font-bold border rounded-lg bg-background"
                        value={editingTenant?.maxTeachers ?? 20}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxTeachers: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border  bg-card">
                      <span className="text-xs font-semibold text-foreground">Max Parents</span>
                      <input
                        type="number"
                        className="w-24 h-8 px-2 text-right text-xs font-bold border rounded-lg bg-background"
                        value={editingTenant?.maxParents ?? 150}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxParents: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl border  bg-card">
                      <span className="text-xs font-semibold text-foreground">Max Classes</span>
                      <input
                        type="number"
                        className="w-24 h-8 px-2 text-right text-xs font-bold border rounded-lg bg-background"
                        value={editingTenant?.maxClasses ?? 10}
                        onChange={(e) => setEditingTenant({ ...editingTenant, maxClasses: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 items-start gap-3">
                  <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="size-3.5" />
                  </div>
                  <div className="text-xs leading-relaxed text-blue-900 dark:text-blue-200">
                    <p className="font-bold text-blue-950 dark:text-blue-100 text-xs">Important Information</p>
                    <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-1 leading-normal">
                      Updating these settings will immediately affect the school's ability to login and add data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:px-6 sm:py-4 border-t  bg-muted flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="hidden sm:flex h-10 px-4 rounded-xl text-xs font-semibold border-rose-200 text-rose-600 dark:text-rose-400 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
              onClick={() => setIsConfirmCancelOpen(true)}
            >
              <AlertCircle className="size-3.5" />
              <span>Cancel Subscription</span>
            </Button>

            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-semibold  bg-card hover:bg-accent"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-xs"
                onClick={() => setIsConfirmUpdateOpen(true)}
              >
                <ShieldCheck className="size-4 stroke-[2.5]" />
                <span>Update License</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: Update License */}
      <Dialog open={isConfirmUpdateOpen} onOpenChange={setIsConfirmUpdateOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border ">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
              <ShieldCheck className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-base font-bold text-foreground">
                Confirm License Changes
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to update the subscription limits and license details for <strong className="text-foreground">{editingTenant?.name}</strong>?
              </p>
              <div className="mt-3 p-3 rounded-xl bg-muted border  text-[11px] text-foreground space-y-1">
                <p>• Plan: <strong className="text-foreground capitalize">{editingTenant?.plan}</strong></p>
                <p>• Status: <strong className="text-foreground capitalize">{editingTenant?.status}</strong></p>
                <p>• Student Limit: <strong className="text-foreground">{editingTenant?.maxStudents}</strong></p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs"
              onClick={() => setIsConfirmUpdateOpen(false)}
            >
              Back
            </Button>
            <Button
              size="sm"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              onClick={onSave}
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  <span>Confirm & Save</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal: Cancel Subscription */}
      <Dialog open={isConfirmCancelOpen} onOpenChange={setIsConfirmCancelOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-3xl border border-rose-200 dark:border-rose-950/60">
          <div className="flex items-start gap-4">
            <div className="size-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
              <AlertCircle className="size-5" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-base font-bold text-foreground">
                Cancel Subscription?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will immediately change the status of <strong className="text-foreground">{editingTenant?.name}</strong> to <strong className="text-rose-600 dark:text-rose-400">Suspended</strong>.
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs"
              onClick={() => setIsConfirmCancelOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isSubmittingAction}
              className="h-9 px-4 rounded-xl text-xs gap-1.5"
              onClick={onCancelSubscription}
            >
              {isSubmittingAction ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Canceling…</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5" />
                  <span>Yes, Cancel Subscription</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
