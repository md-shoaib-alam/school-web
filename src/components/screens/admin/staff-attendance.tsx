"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  UserCheck,
  UserX,
  Clock,
  Search,
  CheckCircle2,
  Users,
  CalendarDays,
  Save,
  RotateCcw,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAppStore } from "@/store/use-app-store";
import { format, parseISO } from "date-fns";
import { goeyToast as toast } from "goey-toast";
import { DatePicker } from "@/components/ui/date-picker";

type AttendanceStatus = "present" | "absent";

const getStatusBg = (status: string) => {
  switch (status) {
    case "present":
      return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    case "absent":
      return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    default:
      return "";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return <UserCheck className="size-3.5" />;
    case "absent":
      return <UserX className="size-3.5" />;
    default:
      return null;
  }
};

interface StaffAttendanceProps {
  initialTab?: string;
}

export function StaffAttendance({ initialTab }: StaffAttendanceProps) {
  const queryClient = useQueryClient();
  const { currentTenantId } = useAppStore();
  const [activeTab, setActiveTab] = useState(initialTab || "teacher");
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>(
    {},
  );

  // 🚀 Scaling-Ready Data Fetching with Axios
  const { data: attendanceData, isLoading: queryLoading, error } = useQuery({
    queryKey: ["staff-attendance", activeTab, selectedDate],
    queryFn: async () => {
      console.log(`[FRONTEND] Fetching attendance for ${activeTab} on ${selectedDate}`);
      
      const [staffList, attendanceList] = await Promise.all([
        api.get<any[]>(`/staff?role=${activeTab}&mode=min`),
        api.get<any[]>(`/staff-attendance?date=${selectedDate}`),
      ]);

      const staff = Array.isArray(staffList) ? staffList : (staffList as any).data || [];
      const attendance = Array.isArray(attendanceList) ? attendanceList : (attendanceList as any).data || [];
      
      console.log(`[FRONTEND] Received ${staff.length} staff members`);

      const attendanceMap = new Map(
        attendance.map((a: any) => [a.userId, a]),
      );

      return staff.map((u: any) => ({
        id: u.id,
        staffName: u.name,
        role: u.customRole?.name || u.role,
        status: (attendanceMap.get(u.id) as any)?.status || "absent",
      }));
    },
    enabled: !!currentTenantId,
    refetchOnWindowFocus: true,
  });

  const { mutate: bulkMark, isPending: isSaving } = useMutation({
    mutationFn: (data: any) => api.post("/staff-attendance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-attendance"] });
      setPendingChanges({});
      toast.success("Attendance synced successfully!");
    },
  });

  const handleSave = () => {
    const records = Object.entries(pendingChanges).map(([userId, status]) => ({
      userId,
      status,
      checkIn: status === "present" ? "09:00 AM" : undefined,
    }));

    if (records.length) {
      bulkMark({ date: selectedDate, records });
    }
  };

  useEffect(() => {
    setPendingChanges({});
  }, [selectedDate, activeTab]);

  const handleStatusChange = (userId: string, status: AttendanceStatus) => {
    setPendingChanges((prev) => ({ ...prev, [userId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newChanges = { ...pendingChanges };
    records.forEach((r) => {
      newChanges[r.id] = status;
    });
    setPendingChanges(newChanges);
    toast.success(
      `Marked all ${activeTab === "teacher" ? "Teachers" : "Staff"} as ${status} locally.`,
    );
  };

  const records = attendanceData || [];
  const stats = useMemo(() => {
    let p = 0,
      a = 0;
    records.forEach((r) => {
      const s = pendingChanges[r.id] || r.status;
      if (s === "present") p++;
      else if (s === "absent") a++;
    });
    return { p, a, total: records.length };
  }, [records, pendingChanges]);

  const filtered = records.filter((r) =>
    r.staffName.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const hasChanges = Object.keys(pendingChanges).length > 0;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6 md:pb-18 pb-26">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {activeTab === 'teacher' ? <GraduationCap className="size-7 text-emerald-600" /> : <Briefcase className="size-7 text-blue-600" />}
            {activeTab === 'teacher' ? 'Teacher Attendance' : 'Admin Staff Attendance'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {activeTab === 'teacher' ? 'Manage daily attendance logs for all teachers.' : 'Manage daily attendance logs for admin staff members.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DatePicker
            date={selectedDate ? parseISO(selectedDate) : undefined}
            onChange={(d) => {
              if (d) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                setSelectedDate(`${yyyy}-${mm}-${dd}`);
              }
            }}
            className="rounded-xl dark:[color-scheme:dark] w-fit"
          />
        </div>
      </div>

      {!initialTab && (
        <Tabs
          defaultValue="teacher"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl h-12">
            <TabsTrigger
              value="teacher"
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm font-bold flex items-center gap-2"
            >
              <GraduationCap className="size-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm font-bold flex items-center gap-2"
            >
              <Briefcase className="size-4" />
              Admin Staff
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

        <div className="grid grid-cols-3 gap-3 mt-6">
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="size-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                  Total
                </p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.total}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <UserCheck className="size-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                  Present
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.p}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <UserX className="size-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                  Absent
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {stats.a}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      <div className="mt-6">
        <Card className="rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3 sticky top-0 bg-white dark:bg-zinc-900/80 backdrop-blur-md z-10 border-b border-zinc-200 dark:border-zinc-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center justify-between sm:justify-start sm:gap-4 flex-1">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <CalendarDays className="size-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-100 leading-none">
                        {activeTab === "teacher" ? "Teachers List" : "Staff List"}
                      </h3>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
                        Attendance Registry
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-6 px-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 rounded-md font-bold"
                  >
                    {records.length} total
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 rounded-xl sm:w-auto">
                  <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600 italic">
                    Quick:
                  </div>
                  <button
                    className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95"
                    onClick={() => markAll("present")}
                  >
                    All Present
                  </button>
                  <button
                    className="flex-1 sm:flex-none py-1.5 px-3 rounded-lg text-[10px] font-bold transition-all bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 hover:bg-red-500/20 active:scale-95"
                    onClick={() => markAll("absent")}
                  >
                    All Absent
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="relative group max-w-sm mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <Input
                  placeholder={`Search ${activeTab === "teacher" ? "teachers" : "staff"}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>


                <div className="space-y-2">
                  {queryLoading ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                      ))
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-zinc-400 text-sm italic">
                        No records found for {activeTab}.
                      </p>
                    </div>
                  ) : (
                    filtered.map((staff, index) => {
                      const mod = !!pendingChanges[staff.id];
                      const cur = (pendingChanges[staff.id] ||
                        staff.status) as AttendanceStatus;
                      return (
                        <div
                          key={staff.id}
                          className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border transition-all ${getStatusBg(cur)}`}
                        >
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono w-6 text-center">
                              {index + 1}
                            </span>
                            <Avatar className="size-8 flex-shrink-0">
                              <AvatarFallback className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {getInitials(staff.staffName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate capitalize">
                                {staff.staffName}
                              </p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                {staff.role}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto">
                            {(
                              [
                                "present",
                                "absent",
                              ] as AttendanceStatus[]
                            ).map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusChange(staff.id, status)
                                }
                                className={`flex flex-1 sm:flex-none items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                  cur === status
                                    ? `${getStatusBg(status)} ${status === "present" ? "bg-emerald-500 dark:bg-emerald-500 text-white" : "bg-red-500 dark:bg-red-500 text-white"} border-transparent shadow-sm ring-1 ring-white/10`
                                    : "border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-950"
                                }`}
                              >
                                {getStatusIcon(status)}
                                <span className="sm:inline capitalize">
                                  {status}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

            </CardContent>
          </Card>
      </div>

      <div className="fixed bottom-6 left-6 right-6 lg:left-[calc(18rem+1.5rem)] lg:right-10 flex flex-col sm:flex-row items-center justify-between bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-4 px-6 rounded-2xl shadow-2xl border border-zinc-100/20 dark:border-zinc-800/50 gap-4 z-[100]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {hasChanges ? (
            <div className="flex items-center gap-3">
              <div className="size-2 bg-violet-500 rounded-full animate-ping" />
              <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">
                {Object.keys(pendingChanges).length} Pending in{" "}
                {activeTab === "teacher" ? "Teachers" : "Staff"}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic hidden sm:inline">
              No unsaved changes
            </span>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 h-12 shadow-lg shadow-blue-500/20 font-bold"
        >
          {isSaving ? (
            "Syncing..."
          ) : (
            <span className="flex items-center justify-center gap-2 tracking-wide">
              <Save className="size-4" /> Save {activeTab} Attendance
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
