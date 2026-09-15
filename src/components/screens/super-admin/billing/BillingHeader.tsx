import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Activity, IndianRupee } from "lucide-react";

interface BillingHeaderProps {
  onRefresh: () => void;
}

export function BillingHeader({
  onRefresh,
}: BillingHeaderProps) {
  return (
    <PageHeader
      icon={<IndianRupee />}
      title="Billing & Revenue"
      description="School billing, transactions, and revenue trends."
      actions={
        <Button variant="outline" onClick={onRefresh}>
          <Activity className="size-4 mr-2" /> Refresh Data
        </Button>
      }
    />
  );
}
