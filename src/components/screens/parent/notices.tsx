"use client";


import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Megaphone, Search, AlertTriangle, Info } from "lucide-react";
import type { NoticeInfo } from "@/lib/types";

const priorityConfig: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  normal: {
    bg: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
    text: "Normal",
    border: "border-l-gray-400 dark:border-l-gray-600",
    icon: <Info className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />,
  },
  important: {
    bg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    text: "Important",
    border: "border-l-orange-500",
    icon: (
      <AlertTriangle className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
    ),
  },
  urgent: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    text: "Urgent",
    border: "border-l-red-500",
    icon: (
      <AlertTriangle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
    ),
  },
};

const roleConfig: Record<string, string> = {
  admin:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  teacher: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  student:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  parent:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  all: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

const roleLabels: Record<string, string> = {
  admin: "Admins",
  teacher: "Teachers",
  student: "Students",
  parent: "Parents",
  all: "Everyone",
};

export function ParentNotices() {
  const [notices, setNotices] = useState<NoticeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await apiFetch("/api/notices");
        if (!res.ok) throw new Error("Failed to fetch notices");
        const data = await res.json();
        const filtered = data.filter(
          (n: NoticeInfo) =>
            n.targetRole === "parent" || n.targetRole === "all",
        );
        setNotices(filtered);
      } catch {
        console.error("Error fetching notices");
      } finally {
        setLoading(false);
      }
    }
    fetchNotices();
  }, []);

  const filtered = notices.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchPriority =
      priorityFilter === "all" || n.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  if (loading) return <NoticesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          School Notices
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notices..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="important">Important</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notice Cards */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No notices found</p>
            <p className="text-sm">
              {search || priorityFilter !== "all"
                ? "Try adjusting your search or filter."
                : "There are no notices at the moment."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((notice) => {
            const priority =
              priorityConfig[notice.priority] || priorityConfig.normal;
            const roleClass = roleConfig[notice.targetRole] || roleConfig.all;
            const roleLabel =
              roleLabels[notice.targetRole] || notice.targetRole;

            return (
              <Card
                key={notice.id}
                className={`border-l-4 ${priority.border} hover:shadow-md transition-shadow rounded-xl`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title and badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {notice.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${priority.bg}`}
                        >
                          {priority.icon}
                          <span className="ml-1">{priority.text}</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium capitalize ${roleClass}`}
                        >
                          {roleLabel}
                        </Badge>
                      </div>

                      {/* Content preview */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {notice.content}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>
                          By{" "}
                          <span className="font-medium text-gray-600 dark:text-gray-400">
                            {notice.authorName}
                          </span>
                        </span>
                        <span>
                          {new Date(notice.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {filtered.length} of {notices.length} notices
        </p>
      )}
    </div>
  );
}

function NoticesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
