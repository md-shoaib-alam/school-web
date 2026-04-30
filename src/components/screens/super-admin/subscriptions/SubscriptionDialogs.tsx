import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Crown, Loader2, Star } from "lucide-react";
import { SubscriptionRecord } from "./types";

interface SubscriptionDialogsProps {
  // Create
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  createForm: any;
  setCreateForm: any;
  parents: any[];
  onCreateSubmit: () => void;
  processing: boolean;

  // Edit
  editOpen: SubscriptionRecord | null;
  onEditOpenChange: (sub: SubscriptionRecord | null) => void;
  editForm: any;
  setEditForm: any;
  onEditSubmit: () => void;

  // Extend
  extendOpen: SubscriptionRecord | null;
  onExtendOpenChange: (sub: SubscriptionRecord | null) => void;
  extendDays: string;
  setExtendDays: (days: string) => void;
  onExtendSubmit: () => void;

  // Delete
  deleteOpen: SubscriptionRecord | null;
  onDeleteOpenChange: (sub: SubscriptionRecord | null) => void;
  onDeleteConfirm: () => void;
  deleting: boolean;
}

export function SubscriptionDialogs({
  createOpen,
  onCreateOpenChange,
  createForm,
  setCreateForm,
  parents,
  onCreateSubmit,
  processing,
  editOpen,
  onEditOpenChange,
  editForm,
  setEditForm,
  onEditSubmit,
  extendOpen,
  onExtendOpenChange,
  extendDays,
  setExtendDays,
  onExtendSubmit,
  deleteOpen,
  onDeleteOpenChange,
  onDeleteConfirm,
  deleting,
}: SubscriptionDialogsProps) {
  return (
    <>
      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Setup New Subscription</DialogTitle>
            <DialogDescription>
              Manually create a premium plan for a parent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select
                value={createForm.parentId}
                onValueChange={(val) =>
                  setCreateForm((p: any) => ({ ...p, parentId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Parent" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select
                  value={createForm.planId}
                  onValueChange={(val) => {
                    const monthlyPrices: Record<string, number> = { basic: 0, standard: 11, premium: 29 };
                    const quarterlyPrices: Record<string, number> = { basic: 0, standard: 29, premium: 79 };
                    const yearlyPrices: Record<string, number> = { basic: 0, standard: 99, premium: 249 };
                    
                    const selectedPrice = createForm.period === "yearly" 
                      ? yearlyPrices[val] 
                      : createForm.period === "quarterly" 
                        ? quarterlyPrices[val] 
                        : monthlyPrices[val];
                        
                    setCreateForm((p: any) => ({
                      ...p,
                      planId: val,
                      planName: val.charAt(0).toUpperCase() + val.slice(1),
                      amount: selectedPrice || 0,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={createForm.period}
                  onValueChange={(val) => {
                    const monthlyPrices: Record<string, number> = { basic: 0, standard: 11, premium: 29 };
                    const quarterlyPrices: Record<string, number> = { basic: 0, standard: 29, premium: 79 };
                    const yearlyPrices: Record<string, number> = { basic: 0, standard: 99, premium: 249 };
                    
                    const selectedPrice = val === "yearly" 
                      ? yearlyPrices[createForm.planId] 
                      : val === "quarterly" 
                        ? quarterlyPrices[createForm.planId] 
                        : monthlyPrices[createForm.planId];
                        
                    setCreateForm((p: any) => ({ 
                      ...p, 
                      period: val,
                      amount: selectedPrice || p.amount 
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) =>
                    setCreateForm((p: any) => ({
                      ...p,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={createForm.paymentMethod}
                  onValueChange={(val) =>
                    setCreateForm((p: any) => ({ ...p, paymentMethod: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Manual / Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onCreateOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={onCreateSubmit}
              disabled={processing || !createForm.parentId}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOpen} onOpenChange={(open) => !open && onEditOpenChange(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Modify existing plan details for {editOpen?.parent?.user?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Select
                  value={editForm.planName.toLowerCase().replace(" plan", "")}
                  onValueChange={(val) => {
                    const monthlyPrices: Record<string, number> = { basic: 0, standard: 11, premium: 29 };
                    const quarterlyPrices: Record<string, number> = { basic: 0, standard: 29, premium: 79 };
                    const yearlyPrices: Record<string, number> = { basic: 0, standard: 99, premium: 249 };
                    
                    const currentPeriod = editForm.period || "monthly";
                    const selectedPrice = currentPeriod === "yearly" 
                      ? yearlyPrices[val] 
                      : currentPeriod === "quarterly" 
                        ? quarterlyPrices[val] 
                        : monthlyPrices[val];
                        
                    setEditForm((p: any) => ({
                      ...p,
                      planName: val.charAt(0).toUpperCase() + val.slice(1) + " Plan",
                      amount: selectedPrice || 0,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic Plan</SelectItem>
                    <SelectItem value="standard">Standard Plan</SelectItem>
                    <SelectItem value="premium">Premium Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Select
                  value={editForm.period || "monthly"}
                  onValueChange={(val) => {
                    const monthlyPrices: Record<string, number> = { basic: 0, standard: 11, premium: 29 };
                    const quarterlyPrices: Record<string, number> = { basic: 0, standard: 29, premium: 79 };
                    const yearlyPrices: Record<string, number> = { basic: 0, standard: 99, premium: 249 };
                    
                    const currentPlanId = editForm.planName.toLowerCase().replace(" plan", "");
                    const selectedPrice = val === "yearly" 
                      ? yearlyPrices[currentPlanId] 
                      : val === "quarterly" 
                        ? quarterlyPrices[currentPlanId] 
                        : monthlyPrices[currentPlanId];
                        
                    const startDate = editOpen?.startDate ? new Date(editOpen.startDate) : new Date();
                    const newEnd = new Date(startDate);
                    if (val === "monthly") newEnd.setMonth(newEnd.getMonth() + 1);
                    else if (val === "quarterly") newEnd.setMonth(newEnd.getMonth() + 3);
                    else newEnd.setFullYear(newEnd.getFullYear() + 1);
                        
                    setEditForm((p: any) => ({
                      ...p,
                      period: val,
                      amount: selectedPrice || p.amount,
                      endDate: newEnd.toISOString().split('T')[0],
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm((p: any) => ({
                      ...p,
                      amount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm((p: any) => ({ ...p, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <DatePicker
                  date={editForm.endDate ? new Date(editForm.endDate) : undefined}
                  onChange={(date) =>
                    setEditForm((p: any) => ({
                      ...p,
                      endDate: date ? date.toISOString().split('T')[0] : "",
                    }))
                  }
                  className="w-full h-10 rounded-xl border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Auto Renew</Label>
                <Select
                  value={editForm.autoRenew ? "yes" : "no"}
                  onValueChange={(val) =>
                    setEditForm((p: any) => ({ ...p, autoRenew: val === "yes" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Enabled</SelectItem>
                    <SelectItem value="no">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onEditOpenChange(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={onEditSubmit}
              disabled={processing}
            >
              {processing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={!!extendOpen} onOpenChange={(open) => !open && onExtendOpenChange(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
              <CalendarClock className="h-6 w-6" />
            </div>
            <DialogTitle>Extend Validity</DialogTitle>
            <DialogDescription>
              Add extra days to the current subscription period for{" "}
              <span className="font-semibold text-foreground">
                {extendOpen?.parent?.user?.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Number of days to add</Label>
              <div className="grid grid-cols-3 gap-2">
                {["30", "90", "365"].map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={extendDays === d ? "default" : "outline"}
                    className={extendDays === d ? "bg-blue-600" : ""}
                    onClick={() => setExtendDays(d)}
                  >
                    {d} Days
                  </Button>
                ))}
              </div>
              <div className="relative mt-2">
                <Input
                  type="number"
                  placeholder="Custom days..."
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium uppercase">
                  Days
                </span>
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                This will move the end date forward. The parent will retain all
                current plan benefits.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onExtendOpenChange(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={onExtendSubmit}
              disabled={processing || !extendDays}
            >
              {processing ? "Processing..." : "Confirm Extension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteOpen} onOpenChange={(open) => !open && onDeleteOpenChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription record for{" "}
              <span className="font-bold text-foreground">
                {deleteOpen?.parent?.user?.name}
              </span>
              . The parent will lose all premium access immediately. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={onDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
