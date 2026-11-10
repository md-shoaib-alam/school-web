import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowRightLeft,
  Building2,
  Check,
  ExternalLink,
  Plus,
  Search,
  UserMinus,
} from "lucide-react";
import type { TenantInfo } from "./types";

interface UserSchoolInfoSectionProps {
  tenant: TenantInfo | null;
  isSaving: boolean;
  isSchoolPopoverOpen: boolean;
  setIsSchoolPopoverOpen: (open: boolean) => void;
  schoolSearchQuery: string;
  setSchoolSearchQuery: (value: string) => void;
  filteredTenants: TenantInfo[];
  onRequestSchoolChange: (newTenantId: string | null) => void;
  onViewSchool: () => void;
}

export function UserSchoolInfoSection({
  tenant,
  isSaving,
  isSchoolPopoverOpen,
  setIsSchoolPopoverOpen,
  schoolSearchQuery,
  setSchoolSearchQuery,
  filteredTenants,
  onRequestSchoolChange,
  onViewSchool,
}: UserSchoolInfoSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            School Information
          </h3>
        </div>

        {/* Quick Assign / Change School Popover */}
        <Popover open={isSchoolPopoverOpen} onOpenChange={setIsSchoolPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving}
              className="h-8 px-3 rounded-xl border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 hover:bg-blue-100/70 text-blue-600 dark:text-blue-400 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
            >
              <ArrowRightLeft className="size-3.5" />
              <span>{tenant ? "Change School" : "Assign to School"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-950">
            <div className="p-3 border-b border-slate-100 dark:border-zinc-800 space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {tenant ? "Change User's School" : "Assign User to School"}
              </p>
                <div className="relative">
                  <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    placeholder="Search school name..."
                    className="h-8 pl-8 text-xs rounded-lg bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                {/* Option: Platform Level / Unassigned (No School) */}
                <button
                  type="button"
                  onClick={() => onRequestSchoolChange(null)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    !tenant
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                      : "hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      <Building2 className="size-3 text-slate-500" />
                    </div>
                    <div className="truncate">
                      <p className="truncate font-medium">Platform Level (No School)</p>
                      <p className="text-[10px] text-slate-400">Global Admin / Unassigned</p>
                    </div>
                  </div>
                  {!tenant && <Check className="size-3.5 text-blue-600 shrink-0" />}
                </button>

                {filteredTenants.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-400">No schools found</p>
                ) : (
                  filteredTenants.map((t) => {
                    const isCurrent = tenant?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onRequestSchoolChange(t.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          isCurrent
                            ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                            : "hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="size-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                            <Building2 className="size-3" />
                          </div>
                          <div className="truncate">
                            <p className="truncate font-medium">{t.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{t.slug ? `/${t.slug}` : t.id}</p>
                          </div>
                        </div>
                        {isCurrent && <Check className="size-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </PopoverContent>
          </Popover>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
            tenant 
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" 
              : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
          }`}>
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {tenant?.name || "Platform Level (No Tenant)"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {tenant?.slug ? `/${tenant.slug}` : "Global Admin • No School Assigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {tenant ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewSchool}
                className="h-8 px-3 rounded-xl border-blue-200 dark:border-blue-900/60 bg-blue-50/50 hover:bg-blue-100/70 text-blue-600 dark:text-blue-400 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>View School</span>
                <ExternalLink className="size-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => onRequestSchoolChange(null)}
                className="h-8 px-3 rounded-xl border-rose-200 dark:border-rose-900/60 bg-rose-50/50 hover:bg-rose-100/70 text-rose-600 dark:text-rose-400 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
                title="Deassign / remove this school"
              >
                <UserMinus className="size-3" />
                <span>Deassign</span>
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSchoolPopoverOpen(true)}
              className="h-8 px-3 rounded-xl border-blue-200 dark:border-blue-900/60 bg-blue-50/50 hover:bg-blue-100/70 text-blue-600 dark:text-blue-400 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="size-3" />
              <span>Assign to School</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
