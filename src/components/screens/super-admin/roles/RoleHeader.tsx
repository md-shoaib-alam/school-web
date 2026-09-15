import { Button } from "@/components/ui/button";
import { Shield, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface RoleHeaderProps {
  onCreateRole: () => void;
}

export function RoleHeader({ onCreateRole }: RoleHeaderProps) {
  return (
    <PageHeader
      icon={<Shield />}
      title="Roles & Permissions"
      description="Define granular access control and assign roles to platform staff"
      actions={
        <Button onClick={onCreateRole}>
          <Plus className="size-4 mr-2" /> Create Role
        </Button>
      }
    />
  );
}
