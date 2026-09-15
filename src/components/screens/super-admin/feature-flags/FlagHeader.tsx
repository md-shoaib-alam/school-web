import { Blocks } from "lucide-react";
import { NewFlagDialog } from "./NewFlagDialog";
import { FeatureFlag } from "./types";
import { PageHeader } from "@/components/ui/page-header";

interface FlagHeaderProps {
  onAddFlag: (flag: FeatureFlag) => void;
}

export function FlagHeader({ onAddFlag }: FlagHeaderProps) {
  return (
    <PageHeader
      icon={<Blocks />}
      title="Feature Flags"
      description="Control global feature rollouts and plan-based access across platform tenants."
      actions={<NewFlagDialog onAdd={onAddFlag} />}
    />
  );
}