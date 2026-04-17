import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Blocks } from "lucide-react";
import { ROLE_TEMPLATES } from "./types";

interface RoleTemplatesProps {
  onSelectTemplate: (template: typeof ROLE_TEMPLATES[0]) => void;
}

export function RoleTemplates({ onSelectTemplate }: RoleTemplatesProps) {
  return (
    <Card className="border-none bg-white dark:bg-gray-800 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Blocks className="h-4 w-4 text-teal-500" />
          Role Templates
        </CardTitle>
        <CardDescription>
          Pre-configured roles — click to create instantly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {ROLE_TEMPLATES.map((template) => {
            const permCount = Object.values(template.permissions).flat().length;
            return (
              <button
                key={template.name}
                onClick={() => onSelectTemplate(template)}
                className="flex flex-col gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-all text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 dark:bg-gray-900/50 rounded-bl-full -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-100/50 dark:group-hover:bg-teal-800/30 transition-colors" />
                <div className="relative z-10 flex items-center gap-2 mb-1">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
                    style={{ backgroundColor: template.color }}
                  >
                    {template.name.charAt(0)}
                  </div>
                  <span className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                    {template.name}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed h-8">
                  {template.description}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-[9px] font-bold h-5 px-2 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-none">
                    {permCount} Permissions
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
