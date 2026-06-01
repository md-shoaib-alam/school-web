import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Blocks, Plus } from "lucide-react";
import { FeatureFlag, Plan, categoryIcons } from "./types";

export function NewFlagDialog({ onAdd }: { onAdd: (flag: FeatureFlag) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FeatureFlag["category"]>("starter");
  const [plan, setPlan] = useState("All");

  const handleCreate = () => {
    if (!name.trim()) return;
    const newFlag: FeatureFlag = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      name: name.trim(),
      description: description.trim() || "No description provided.",
      enabled: false,
      rolloutPercentage: 0,
      targetedPlans: [plan as Plan],
      category,
      icon: categoryIcons[category] || Blocks,
    };
    onAdd(newFlag);
    setName("");
    setDescription("");
    setCategory("starter");
    setPlan("All");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold text-xs cursor-pointer shadow-xs transition-colors">
          <Plus className="size-4 mr-1.5" />
          Create New Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-lg border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-left">
        <DialogHeader>
          <div className="size-10 rounded-md bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center mb-3 border border-teal-100 dark:border-teal-900/50">
            <Blocks className="size-5.5 text-teal-600 dark:text-teal-400" />
          </div>
          <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-white">
            Create Feature Flag
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Add a new feature flag to control feature rollout across platform tenants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="flag-name" className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 ml-0.5">Flag Name</Label>
            <Input
              id="flag-name"
              placeholder="e.g., AI Assessment Suite"
              className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 focus:bg-white dark:focus:bg-zinc-900 text-xs font-medium focus-visible:ring-1 focus-visible:ring-teal-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="flag-desc" className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 ml-0.5">Flag Description</Label>
            <Input
              id="flag-desc"
              placeholder="What does this feature toggle?"
              className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 focus:bg-white dark:focus:bg-zinc-900 text-xs font-medium focus-visible:ring-1 focus-visible:ring-teal-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 ml-0.5">Classification</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as FeatureFlag["category"])}
              >
                <SelectTrigger className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 focus:bg-white dark:focus:bg-zinc-900 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <SelectItem value="starter" className="text-xs font-medium py-2">Starter Tier</SelectItem>
                  <SelectItem value="standard" className="text-xs font-medium py-2">Standard Tier</SelectItem>
                  <SelectItem value="premium" className="text-xs font-medium py-2">Premium Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 ml-0.5">Plan Targeted</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 focus:bg-white dark:focus:bg-zinc-900 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                  <SelectItem value="All" className="text-xs font-medium py-2">All Schools</SelectItem>
                  <SelectItem value="Starter" className="text-xs font-medium py-2">Starter Only</SelectItem>
                  <SelectItem value="Standard" className="text-xs font-medium py-2">Standard Only</SelectItem>
                  <SelectItem value="Premium" className="text-xs font-medium py-2">Premium Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-4">
          <Button variant="outline" className="rounded-md h-9 text-xs font-semibold px-4 cursor-pointer" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-md h-9 text-xs font-semibold px-5 cursor-pointer shadow-xs"
          >
            Create Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

