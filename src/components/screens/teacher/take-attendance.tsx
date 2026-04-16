"use client";


import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCheck,
  UserX,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  Users,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  studentCount: number;
}

interface StudentInfo {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
  gender: string;
}

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

export function TeacherAttendance() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/classes");
      const data = await res.json();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClassId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents();
    }
  }, [selectedClassId]);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    setSaved(false);
    try {
      const res = await apiFetch(`/api/students?classId=${selectedClassId}`);
      const data = await res.json();
      setStudents(data);

      const attRes = await apiFetch(
        `/api/attendance?classId=${selectedClassId}&date=${date}`,
      );
      const attData = await attRes.json();
      const existingRecords: AttendanceRecord[] = data.map((s: StudentInfo) => {
        const existing = attData.find((a: any) => a.studentId === s.id);
        return {
          studentId: s.id,
          status: existing ? (existing.status as AttendanceStatus) : "present",
        };
      });
      setRecords(existingRecords);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const updateRecord = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
    );
    setSaved(false);
  };

  const markAll = (status: AttendanceStatus) => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const res = await apiFetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          date,
          records,
        }),
      });
      if (res.ok) {
        setSaved(true);
        toast({
          title: "Attendance Saved",
          description: `Attendance for ${date} has been recorded successfully.`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const totalCount = records.length;

  const getStatusBg = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
      case "absent":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "late":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <UserCheck className="h-3.5 w-3.5" />;
      case "absent":
        return <UserX className="h-3.5 w-3.5" />;
      case "late":
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Take Attendance
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Record daily attendance for your classes.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-xs">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} - Section {cls.section} ({cls.studentCount}{" "}
                  students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="max-w-[180px]">
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSaved(false);
            }}
            className="rounded-xl"
          />
        </div>
      </div>

      {students.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Total
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {totalCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Present
                </p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {presentCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Absent
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {absentCount}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  Late
                </p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {lateCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="rounded-xl shadow-sm border-0">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              {selectedClass
                ? `${selectedClass.name} - Section ${selectedClass.section}`
                : "Select a class"}
              <Badge
                variant="secondary"
                className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              >
                {students.length} students
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">
                Quick:
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-400"
                onClick={() => markAll("present")}
              >
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => markAll("absent")}
              >
                All Absent
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {studentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : students.length > 0 ? (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-2">
                {students.map((student, index) => {
                  const record = records.find(
                    (r) => r.studentId === student.id,
                  );
                  const currentStatus = record?.status || "present";
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${getStatusBg(currentStatus)}`}
                    >
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono w-6 text-center">
                        {index + 1}
                      </span>

                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {student.rollNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {(
                          ["present", "absent", "late"] as AttendanceStatus[]
                        ).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateRecord(student.id, status)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                              currentStatus === status
                                ? `${getStatusBg(status)} ${status === "present" ? "bg-emerald-500 dark:bg-emerald-500 text-white" : status === "absent" ? "bg-red-500 dark:bg-red-500 text-white" : "bg-amber-500 dark:bg-amber-500 text-white"} border-transparent`
                                : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300"
                            }`}
                          >
                            {getStatusIcon(status)}
                            <span className="hidden sm:inline capitalize">
                              {status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                {selectedClassId
                  ? "No students in this class"
                  : "Select a class to begin"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {saved && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>Attendance saved for {date}</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-sm"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Attendance
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
