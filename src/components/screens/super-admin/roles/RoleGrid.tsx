import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Pencil, 
  Trash2, 
  Users, 
  UserPlus, 
  Blocks,
  ExternalLink
} from "lucide-react";
import { PlatformRoleRecord, ACTION_LABELS, PLATFORM_MODULES } from "./types";

interface RoleGridProps {
  roles: PlatformRoleRecord[];
  onEdit: (role: PlatformRoleRecord) => void;
  onDelete: (id: string) => void;
  onAssignUsers: (role: PlatformRoleRecord) => void;
}

export function RoleGrid({ roles, onEdit, onDelete, onAssignUsers }: RoleGridProps) {
  if (roles.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-100 dark:border-gray-800 bg-transparent">
        <CardContent className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6">
            <Shield className="h-10 w-10 opacity-20" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">No platform roles yet</p>
          <p className="text-sm mt-1 max-w-[280px] text-center leading-relaxed">
            Create your first custom role or use a template above to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((role) => {
        const perms = JSON.parse(role.permissions || "{}");
        const permCount = Object.values(perms).flat().length;
        const moduleCount = Object.keys(perms).filter(
          (k) => (perms[k] || []).length > 0,
        ).length;
        const userCount = role._count?.users ?? 0;

        return (
          <Card key={role.id} className="hover:shadow-lg transition-all border-none bg-white dark:bg-gray-800 group overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 w-1.5 h-full opacity-70 group-hover:opacity-100 transition-opacity" 
              style={{ backgroundColor: role.color }}
            />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black tracking-tight leading-tight">{role.name}</CardTitle>
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-medium">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/40"
                    onClick={() => onAssignUsers(role)}
                    title="Assign Users"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/40"
                    onClick={() => onEdit(role)}
                    title="Edit Role"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40"
                        title="Delete Role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Platform Role</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;<span className="font-bold text-foreground">{role.name}</span>&quot;?
                          {userCount > 0
                            ? `\n\n⚠️ ${userCount} user(s) are currently assigned to this role. You must unassign them before deleting.`
                            : "\n\nThis action cannot be undone and will remove all associated permissions."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                          onClick={() => onDelete(role.id)}
                        >
                          Delete Role
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-teal-600" />
                  <span>{permCount} Perms</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Blocks className="h-3.5 w-3.5 text-blue-600" />
                  <span>{moduleCount} Modules</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                  <span>{userCount} Users</span>
                </div>
              </div>

              {/* Permission Matrix Preview */}
              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-hidden relative">
                {permCount > 0 ? (
                  Object.entries(perms).map(([mod, actions]) =>
                    (actions as string[]).map((action: string) => (
                      <Badge
                        key={`${mod}-${action}`}
                        variant="outline"
                        className="text-[10px] px-2 py-0 h-5 font-bold border-none transition-colors"
                        style={{
                          backgroundColor: role.color + "15",
                          color: role.color,
                        }}
                      >
                        {PLATFORM_MODULES.find((m) => m.key === mod)?.label || mod} · {ACTION_LABELS[action]}
                      </Badge>
                    )),
                  )
                ) : (
                  <p className="text-[10px] text-muted-foreground font-medium italic">No permissions defined</p>
                )}
                {permCount > 8 && (
                  <div className="absolute bottom-0 right-0 h-6 w-12 bg-gradient-to-l from-white dark:from-gray-800 to-transparent flex items-center justify-end">
                    <span className="text-[10px] font-black text-muted-foreground">+{permCount - 8}</span>
                  </div>
                )}
              </div>

              {/* Manage Link */}
              <button
                className="w-full pt-3 mt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between group/link text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
                onClick={() => onAssignUsers(role)}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Manage {userCount} assigned staff
                </div>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-all -translate-x-2 group-hover/link:translate-x-0" />
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
