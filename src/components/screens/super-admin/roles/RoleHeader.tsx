import { Button } from "@/components/ui/button";
import { Shield, Plus } from "lucide-react";

interface RoleHeaderProps {
  onCreateRole: () => void;
}

export function RoleHeader({ onCreateRole }: RoleHeaderProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
      <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-teal-600/10 rounded-full translate-y-1/2 blur-xl" />
      
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
            <Shield className="h-7 w-7 text-teal-200" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Platform Roles & Permissions</h2>
            <p className="text-teal-100 text-sm mt-0.5 opacity-90">
              Define granular access control and assign roles to platform staff
            </p>
          </div>
        </div>
        <Button
          onClick={onCreateRole}
          className="bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md rounded-xl px-6 h-11 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Role
        </Button>
      </div>
    </div>
  );
}
