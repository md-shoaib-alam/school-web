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
  const [category, setCategory] = useState<FeatureFlag["category"]>("core");
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
    setCategory("core");
    setPlan("All");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 px-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-teal-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
          <Plus className="h-4 w-4 mr-2" />
          Create New Flag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-2">
        <DialogHeader>
          <div className="h-12 w-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-4">
            <Blocks className="h-6 w-6 text-teal-600 dark:text-teal-400" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            Create Feature Flag
          </DialogTitle>
          <DialogDescription className="font-medium text-sm">
            Add a new feature flag to control feature rollout across platform tenants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="flag-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Flag Name</Label>
            <Input
              id="flag-name"
              placeholder="e.g., AI Assessment Suite"
              className="h-11 rounded-xl border-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flag-desc" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Flag Description</Label>
            <Input
              id="flag-desc"
              placeholder="What does this feature toggle?"
              className="h-11 rounded-xl border-2 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 font-bold"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Classification</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as FeatureFlag["category"])}
              >
                <SelectTrigger className="h-11 rounded-xl border-2 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="core" className="text-[10px] font-black uppercase tracking-widest py-3">Core Platform</SelectItem>
                  <SelectItem value="premium" className="text-[10px] font-black uppercase tracking-widest py-3">Premium Feature</SelectItem>
                  <SelectItem value="enterprise" className="text-[10px] font-black uppercase tracking-widest py-3">Enterprise Grade</SelectItem>
                  <SelectItem value="beta" className="text-[10px] font-black uppercase tracking-widest py-3">Beta/Experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Plan Targeted</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="h-11 rounded-xl border-2 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="All" className="text-[10px] font-black uppercase tracking-widest py-3">All Schools</SelectItem>
                  <SelectItem value="Basic" className="text-[10px] font-black uppercase tracking-widest py-3">Basic Only</SelectItem>
                  <SelectItem value="Standard+" className="text-[10px] font-black uppercase tracking-widest py-3">Standard+</SelectItem>
                  <SelectItem value="Premium+" className="text-[10px] font-black uppercase tracking-widest py-3">Premium+</SelectItem>
                  <SelectItem value="Enterprise" className="text-[10px] font-black uppercase tracking-widest py-3">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black px-8 shadow-lg shadow-teal-200 dark:shadow-none"
          >
            Create Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
