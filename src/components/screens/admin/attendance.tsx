"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  Eye,
  School,
  Filter,
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { AttendanceRecord, ClassInfo } from "@/lib/types";
import { useModulePermissions } from "@/hooks/use-permissions";
import { useAppStore } from "@/store/use-app-store";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";
import { Pagination } from "@/components/shared/pagination";
import { useTenantResolution } from "@/lib/graphql/hooks/platform.hooks";

const statusConfig: Record<
  string,
  { bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  present: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    text: "Present",
    dot: "bg-emerald-500",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
  absent: {
    bg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    text: "Absent",
    dot: "bg-red-500",
    icon: <UserX className="h-3.5 w-3.5 text-red-500" />,
  },
};

export function AdminAttendance() {
  const { currentTenantId, currentTenantSlug } = useAppStore();
  const { data: tenantData } = useTenantResolution(currentTenantSlug || undefined);
  const plan = tenantData?.plan?.toLowerCase() || "basic";
  const isPremiumOrEnterprise = plan === "premium" || plan === "enterprise";
  const { canCreate, canEdit, canDelete } = useModulePermissions("attendance");
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);



  const { data: attendanceData, isLoading: recordsLoading } = useQuery({
    queryKey: ['attendance', selectedDate, selectedClass, isHistoryMode, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (!isHistoryMode && selectedDate) {
        params.set('date', selectedDate);
      }
      if (selectedClass && selectedClass !== 'all') {
        params.set('classId', selectedClass);
      }
      params.set('page', currentPage.toString());
      params.set('limit', '50');
      
      const res = await apiFetch(`/api/attendance?${params.toString()}`);
      if (!res.ok) return { records: [], total: 0, totalPages: 0 };
      return res.json();
    },
    enabled: !!selectedClass
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes', 'min'],
    queryFn: async () => {
      const res = await apiFetch('/api/classes?mode=min');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const loading = recordsLoading || classesLoading;

  const isSelectionMade = selectedClass !== "";

  const rawRecords = (attendanceData?.records || []) as AttendanceRecord[];
  const records = rawRecords.filter((r) => {
    const matchSearch = !debouncedSearch || 
      r.studentName.toLowerCase().includes(debouncedSearch.toLowerCase());
    return matchSearch;
  });

  // Summary stats
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const total = records.length;
  const presentRate =
    total > 0 ? ((presentCount / total) * 100).toFixed(1) : "0";

  const summaryCards = [
    {
      label: "Present",
      count: presentCount,
      percentage: total > 0 ? ((presentCount / total) * 100).toFixed(1) : "0",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      color:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Absent",
      count: absentCount,
      percentage: total > 0 ? ((absentCount / total) * 100).toFixed(1) : "0",
      icon: <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
    },
    {
      label: "Attendance Rate",
      count: `${presentRate}%`,
      percentage: null,
      icon: <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  ];

  const isDatePickerDisabled = (date: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date > now) return true; // Lock future dates

    let daysAllowed = 7;
    if (plan === 'standard') daysAllowed = 14;
    if (isPremiumOrEnterprise) daysAllowed = 28;

    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - daysAllowed);
    return date < cutoff;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Attendance Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Class-wise attendance tracking and insights
          </p>
        </div>
        <div className="flex items-center gap-3" suppressHydrationWarning>
          <Select
            value={selectedClass}
            onValueChange={(val) => {
              setSelectedClass(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-950 border-gray-200">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="all"
                className="font-bold text-emerald-600 italic"
              >
                <span className="flex items-center gap-2 italic">
                  <Filter className="h-4 w-4" />
                  All Classes
                </span>
              </SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            disabled={isDatePickerDisabled}
            date={!isHistoryMode && selectedDate ? parseISO(selectedDate) : undefined}
            onChange={(d) => {
              setIsHistoryMode(false);
              if (d) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                setSelectedDate(`${yyyy}-${mm}-${dd}`);
                setCurrentPage(1);
              }
            }}
            className="w-[180px]"
          />
          <Button 
            variant={isHistoryMode ? "default" : "outline"} 
            className={`hidden md:flex gap-2 ${!isPremiumOrEnterprise ? 'bg-amber-50/30 border-amber-200/60 opacity-85 cursor-not-allowed text-amber-600 dark:bg-amber-900/10 dark:text-amber-400' : ''}`}
            onClick={() => {
              if (isPremiumOrEnterprise) {
                setIsHistoryMode(!isHistoryMode);
                setCurrentPage(1);
              }
            }}
            disabled={!isPremiumOrEnterprise}
            title={!isPremiumOrEnterprise ? "Full History requires a Premium subscription" : ""}
          >
            {!isPremiumOrEnterprise ? (
              <Lock className="h-4 w-4 text-amber-500" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {isHistoryMode ? "Exit History" : "Full History"}
            {!isPremiumOrEnterprise && (
              <Badge className="ml-1 bg-amber-100 hover:bg-amber-100 text-amber-700 border-amber-200 text-[9px] uppercase h-4 py-0 px-1 rounded-sm">Premium</Badge>
            )}
          </Button>
        </div>
      </div>

      {!isSelectionMade ? (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-full">
            <UserCheck className="h-12 w-12 text-gray-300" />
          </div>
          <div className="max-w-xs">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Ready to track?
            </h4>
            <p className="text-sm text-gray-500 italic">
              Please select a class from the dropdown above to view student
              attendance data.
            </p>
          </div>
        </div>
      ) : (
        /* Data Display */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <Card
                key={card.label}
                className={`border ${card.borderColor} shadow-sm`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {card.label}
                      </p>
                      <div className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                        {loading ? (
                          <Skeleton className="h-8 w-12" />
                        ) : (
                          card.count
                        )}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl ${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  {card.percentage && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusConfig[card.label.toLowerCase()]?.dot || "bg-blue-500"}`}
                          style={{ width: `${card.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">
                        {card.percentage}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-lg border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-bold">
                  Students List
                </CardTitle>
                <CardDescription>
                  {selectedClass === "all"
                    ? "Showing attendance for all school students"
                    : `Showing students enrolled in Class ${classes.find((c) => c.id === selectedClass)?.name}-${classes.find((c) => c.id === selectedClass)?.section}`}
                </CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search students..." 
                  className="pl-9" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
                  <TableRow>
                    <TableHead className="font-bold pl-6">Student Name</TableHead>
                    <TableHead className="font-bold w-[150px]">Class</TableHead>
                    {isHistoryMode && (
                      <TableHead className="font-bold w-[150px]">Date</TableHead>
                    )}
                    <TableHead className="font-bold w-[180px]">Status</TableHead>
                    <TableHead className="font-bold w-[120px]">Time</TableHead>
                    <TableHead className="text-right font-bold pr-6 w-[140px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          {Array(5)
                            .fill(0)
                            .map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-6 w-full" />
                              </TableCell>
                            ))}
                        </TableRow>
                      ))
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isHistoryMode ? 6 : 5}
                        className="h-32 text-center text-gray-500 italic"
                      >
                        No attendance records found for this selection.
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow
                        key={record.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 group transition-colors"
                      >
                        <TableCell className="font-medium pl-6">
                          {record.studentName}
                        </TableCell>
                        <TableCell className="w-[150px]">
                          <Badge
                            variant="outline"
                            className="font-semibold bg-gray-50 dark:bg-gray-950"
                          >
                            {record.className}
                          </Badge>
                        </TableCell>
                        {isHistoryMode && (
                          <TableCell className="font-medium w-[150px]" suppressHydrationWarning>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                        )}
                        <TableCell className="w-[180px]">
                          <Badge
                            className={`${statusConfig[record.status]?.bg} border shadow-sm`}
                          >
                            <span className="flex items-center gap-1.5 pt-0.5">
                              {statusConfig[record.status]?.icon}
                              {statusConfig[record.status]?.text}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm w-[120px]" suppressHydrationWarning>
                          {record.createdAt
                            ? new Date(record.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : record.date && record.date.includes("T")
                            ? new Date(record.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "08:30 AM"}
                        </TableCell>
                        <TableCell className="text-right pr-6 w-[140px]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-semibold"
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* PAGINATION FOOTER */}
          {!loading && isSelectionMade && attendanceData?.totalPages > 1 && (
            <div className="mt-4 pb-6">
              <Pagination 
                currentPage={currentPage}
                totalPages={attendanceData.totalPages}
                totalItems={attendanceData.total || 0}
                itemsPerPage={50}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
