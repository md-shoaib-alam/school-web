"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  ClipboardList, 
  Building2, 
  UploadCloud, 
  Calendar, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  FileSpreadsheet, 
  Check, 
  ChevronsUpDown, 
  Clock, 
  Sparkles, 
  CheckSquare, 
  Square, 
  User, 
  CalendarDays,
  ArrowRight,
  RefreshCw,
  Info,
  XCircle,
  FileCheck2,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  classId: string;
  email?: string;
}

interface ParsedRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  rollNumber?: string;
  className?: string;
  date: string;
  status: string;
  rawStatus?: string;
  remarks?: string;
  isValid: boolean;
  errors: string[];
}

// Safely parse a date string formatted as "YYYY-MM-DD" into a local Date object.
// This prevents timezone-offset shift issues which usually occur with "new Date(dateString)".
const parseDateString = (dateStr: string): Date | undefined => {
  if (!dateStr) return undefined;
  const parts = dateStr.split("-");
  if (parts.length !== 3) return undefined;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return new Date(year, month - 1, day);
};

// Safely format a local Date object into a "YYYY-MM-DD" date string.
const formatDateToString = (date?: Date): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function SuperAdminBulkAttendance() {
  const [activeTab, setActiveTab] = useState<string>("upload");

  // School select states
  const [schools, setSchools] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedSchool, setSelectedSchool] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [schoolPopoverOpen, setSchoolPopoverOpen] = useState(false);

  // Students list of selected school
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Tab 1: Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRecord[]>([]);
  const [validatingFile, setValidatingFile] = useState(false);
  const [importingData, setImportingData] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
    skippedCount: number;
    skippedRecords?: Array<{ record: any; reason: string }>;
  } | null>(null);

  // Tab 2: Range states
  const [allStudentsMode, setAllStudentsMode] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentPopoverOpen, setStudentPopoverOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [rangeStatus, setRangeStatus] = useState<string>("present");
  const [rangeRemarks, setRangeRemarks] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [generatingRange, setGeneratingRange] = useState(false);
  
  // Specific Date overrides within selected range
  const [overriddenStatuses, setOverriddenStatuses] = useState<Record<string, string>>({});
  const [overriddenRemarks, setOverriddenRemarks] = useState<Record<string, string>>({});

  // Scroll tracking for custom circular progress ring
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element) return;
    const totalHeight = element.scrollHeight - element.clientHeight;
    if (totalHeight <= 0) {
      setScrollProgress(0);
      setIsScrolledToBottom(false);
      return;
    }
    const progress = (element.scrollTop / totalHeight) * 100;
    setScrollProgress(progress);
    setIsScrolledToBottom(element.scrollTop + element.clientHeight >= element.scrollHeight - 8);
  };

  // Reset scroll progress when range changes
  useEffect(() => {
    setScrollProgress(0);
    setIsScrolledToBottom(false);
  }, [startDate, endDate]);

  // Reset overrides when date range changes
  useEffect(() => {
    setOverriddenStatuses({});
    setOverriddenRemarks({});
  }, [startDate, endDate]);

  // Fetch active schools
  useEffect(() => {
    async function fetchSchools() {
      setLoadingSchools(true);
      try {
        const res = await api.get('/tenants?limit=1000');
        if (res && res.tenants) {
          setSchools(res.tenants);
        }
      } catch (err: any) {
        toast.error("Failed to load schools: " + err.message);
      } finally {
        setLoadingSchools(false);
      }
    }
    fetchSchools();
  }, []);

  // Fetch students when school changes
  useEffect(() => {
    if (!selectedSchool) {
      setStudents([]);
      setSelectedStudent(null);
      setSelectedClassId("all");
      return;
    }

    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        const res = await apiFetch('/students?mode=min', {
          headers: {
            'x-tenant-id': selectedSchool!.id
          }
        });
        const data = await res.json();
        if (data && data.items) {
          setStudents(data.items);
        }
      } catch (err: any) {
        toast.error("Failed to load students for this school: " + err.message);
      } finally {
        setLoadingStudents(false);
      }
    }
    
    fetchStudents();
    // Reset file / previews when changing school
    setUploadedFile(null);
    setParsedRows([]);
    setImportResult(null);
  }, [selectedSchool]);

  // Filter schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => 
      s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(schoolSearchQuery.toLowerCase())
    );
  }, [schools, schoolSearchQuery]);

  // Unique classes extracted from students list
  const uniqueClasses = useMemo(() => {
    const classesMap = new Map<string, string>();
    students.forEach(s => {
      if (s.classId && s.className) {
        classesMap.set(s.classId, s.className);
      }
    });
    return Array.from(classesMap.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Filter students by selected class and search query
  const filteredStudents = useMemo(() => {
    let result = students;
    if (selectedClassId && selectedClassId !== "all") {
      result = result.filter(s => s.classId === selectedClassId);
    }
    return result.filter(s => 
      s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (s.className && s.className.toLowerCase().includes(studentSearchQuery.toLowerCase()))
    );
  }, [students, selectedClassId, studentSearchQuery]);

  // Generate Excel template prefilled with student list
  const handleDownloadTemplate = async () => {
    if (!selectedSchool) {
      toast.warning("Please select a school first!");
      return;
    }

    setDownloadingTemplate(true);
    try {
      let rows: any[] = [];

      if (students.length > 0) {
        rows = students.map(s => ({
          "Student ID": s.id,
          "Student Name": s.name,
          "Student Email": s.email || "",
          "Roll Number": s.rollNumber || "",
          "Class Name": s.className || "",
          "Date (YYYY-MM-DD)": new Date().toISOString().split('T')[0],
          "Status (PRESENT/ABSENT)": "PRESENT",
          "Remarks": ""
        }));
      } else {
        // Fallback placeholder row if school has no students yet
        rows = [
          {
            "Student ID": "STU12345",
            "Student Name": "John Doe",
            "Student Email": "johndoe@school.com",
            "Roll Number": "10",
            "Class Name": "Grade 5-A",
            "Date (YYYY-MM-DD)": new Date().toISOString().split('T')[0],
            "Status (PRESENT/ABSENT)": "PRESENT",
            "Remarks": "Regular entry"
          }
        ];
      }

      const ws = XLSX.utils.json_to_sheet(rows);
      
      // Auto-fit column widths
      ws['!cols'] = [
        { wch: 15 }, // Student ID
        { wch: 22 }, // Name
        { wch: 25 }, // Email
        { wch: 12 }, // Roll
        { wch: 15 }, // Class
        { wch: 18 }, // Date
        { wch: 40 }, // Status instructions
        { wch: 18 }  // Remarks
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet");
      
      XLSX.writeFile(wb, `${selectedSchool.name.replace(/[^a-zA-Z0-9]/g, '_')}_attendance_template.xlsx`);
      toast.success("Excel template downloaded successfully!");
    } catch (err: any) {
      toast.error("Failed to generate template: " + err.message);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // Drag-and-drop dropzone functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!selectedSchool) {
      toast.warning("Please select a school first!");
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSchool) {
      toast.warning("Please select a school first!");
      return;
    }

    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  // Parse and validate the Excel file
  const processUploadedFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      toast.error("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.");
      return;
    }

    setUploadedFile(file);
    setValidatingFile(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse sheet to JSON array
        const rawRows = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (!rawRows || rawRows.length === 0) {
          toast.error("The uploaded spreadsheet is empty.");
          setParsedRows([]);
          setValidatingFile(false);
          return;
        }

        // Validate rows and normalize headers case-insensitively
        const validated: ParsedRecord[] = rawRows.map((row, idx) => {
          const normalized: Record<string, any> = {};
          
          // Map headers case-insensitively, ignore whitespace, dashes, and parentheses
          Object.keys(row).forEach(key => {
            const normKey = key.trim().toLowerCase().replace(/[\s\-_()]/g, '');
            normalized[normKey] = row[key];
          });

          // Extract values using various header synonyms
          const studentId = String(normalized.studentid || normalized.id || "").trim();
          const studentName = String(normalized.studentname || normalized.name || "").trim();
          const studentEmail = String(normalized.studentemail || normalized.email || normalized.emailid || "").trim();
          const rollNumber = String(normalized.rollnumber || normalized.roll || "").trim();
          const className = String(normalized.classname || normalized.class || "").trim();
          const rawDate = normalized.date || normalized.dateyyyymmdd || normalized.attendancedate;
          const rawStatus = String(normalized.status || normalized.attendancestatus || "").trim();
          const remarks = String(normalized.remarks || normalized.remark || normalized.note || "").trim();

          // Resilient Date parsing
          let dateStr = "";
          if (typeof rawDate === 'number') {
            // Excel serial date format
            try {
              const parsedDate = XLSX.SSF.parse_date_code(rawDate);
              const y = parsedDate.y;
              const m = String(parsedDate.m).padStart(2, '0');
              const d = String(parsedDate.d).padStart(2, '0');
              dateStr = `${y}-${m}-${d}`;
            } catch {
              dateStr = String(rawDate);
            }
          } else if (rawDate instanceof Date) {
            dateStr = rawDate.toISOString().split('T')[0];
          } else if (rawDate) {
            dateStr = String(rawDate).trim();
          }

          // Row validation errors accumulator
          const errors: string[] = [];

          // Validate Date format YYYY-MM-DD
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateStr) {
            errors.push("Missing date");
          } else if (!dateRegex.test(dateStr)) {
            errors.push("Invalid date format (must be YYYY-MM-DD)");
          } else {
            const dObj = new Date(dateStr);
            if (isNaN(dObj.getTime())) {
              errors.push("Date is calendar-invalid");
            }
          }

          // Validate Status
          const cleanStatus = rawStatus.toLowerCase();
          let finalStatus = "present";
          const validStatuses = ["present", "absent"];

          if (!rawStatus) {
            errors.push("Missing status");
          } else if (!validStatuses.includes(cleanStatus)) {
            errors.push(`Invalid status value: "${rawStatus}"`);
          } else {
            // Standardize status value for API
            if (cleanStatus === "present") finalStatus = "present";
            else if (cleanStatus === "absent") finalStatus = "absent";
          }

          // Student identification checking
          if (!studentId && !studentEmail && !(rollNumber && className)) {
            errors.push("Insufficient student data. Include Student ID, Email, or Roll + Class.");
          }

          return {
            id: `row-${idx}`,
            studentId: studentId || undefined,
            studentName: studentName || undefined,
            studentEmail: studentEmail || undefined,
            rollNumber: rollNumber || undefined,
            className: className || undefined,
            date: dateStr,
            status: finalStatus,
            rawStatus: rawStatus,
            remarks: remarks || undefined,
            isValid: errors.length === 0,
            errors
          };
        });

        setParsedRows(validated);
        toast.success(`Successfully parsed ${validated.length} rows. Please review preview below.`);
      } catch (err: any) {
        toast.error("Failed to parse sheet: " + err.message);
        setParsedRows([]);
      } finally {
        setValidatingFile(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // POST the valid rows to the API
  const handleConfirmImport = async () => {
    if (!selectedSchool) {
      toast.warning("Select school first.");
      return;
    }

    const validRows = parsedRows.filter(r => r.isValid);

    if (validRows.length === 0) {
      toast.error("There are no valid records to import.");
      return;
    }

    setImportingData(true);
    setImportResult(null);

    try {
      const payload = {
        records: validRows.map(r => ({
          studentId: r.studentId,
          studentEmail: r.studentEmail,
          rollNumber: r.rollNumber,
          className: r.className,
          date: r.date,
          status: r.status,
          remarks: r.remarks
        }))
      };

      const res = await apiFetch('/attendance/bulk-import', {
        method: 'POST',
        headers: {
          'x-tenant-id': selectedSchool.id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Bulk import completed! Imported: ${data.importedCount}, Skipped: ${data.skippedCount}`);
        setImportResult(data);
        // Clear current states
        setUploadedFile(null);
        setParsedRows([]);
      } else {
        toast.error(data.error || "Failed to import attendance data.");
      }
    } catch (err: any) {
      toast.error("An error occurred during import: " + err.message);
    } finally {
      setImportingData(false);
    }
  };

  // Tab 2: Range computations
  const computedRangeDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    const dates: { dateStr: string; dayLabel: string; isValid: boolean }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [];
    }

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const current = new Date(start);

    // Limit range to max 180 days to prevent browser crash / oversized request
    let limit = 0;
    while (current <= end && limit < 180) {
      const dayOfWeek = current.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const dateStr = current.toISOString().split('T')[0];
      const isWeekDayChecked = selectedDays.includes(dayOfWeek);

      dates.push({
        dateStr,
        dayLabel: dayLabels[dayOfWeek],
        isValid: isWeekDayChecked
      });

      current.setDate(current.getDate() + 1);
      limit++;
    }

    return dates;
  }, [startDate, endDate, selectedDays]);

  const activeRangeDatesCount = useMemo(() => {
    return computedRangeDates.filter(d => d.isValid).length;
  }, [computedRangeDates]);

  const isRangeTooLarge = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return false;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 180;
  }, [startDate, endDate]);

  // Trigger live toast alert when selected date range exceeds 180-day limit
  useEffect(() => {
    if (isRangeTooLarge && startDate && endDate) {
      const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      toast.warning(`Date Range Exceeded (Out of Range)`, {
        description: `Selected range is ${diffDays} days. The system safety limit is 180 days (6 months). Please shorten your selection.`
      });
    }
  }, [isRangeTooLarge, startDate, endDate]);

  // Execute Student Date Range Bulk Entry
  const handleRangeImport = async () => {
    if (!selectedSchool) {
      toast.warning("Please select a school first.");
      return;
    }

    if (!startDate || !endDate) {
      toast.warning("Please select both Start Date and End Date.");
      return;
    }

    if (!allStudentsMode && !selectedStudent) {
      toast.warning("Please select a specific student or apply to all students.");
      return;
    }

    const validDates = computedRangeDates.filter(d => d.isValid).map(d => d.dateStr);

    if (validDates.length === 0) {
      toast.error("No active days selected in the range based on your day filters.");
      return;
    }

    setGeneratingRange(true);
    try {
      const recordsToPost: any[] = [];
      const targetStudents = allStudentsMode ? students : [selectedStudent!];

      if (targetStudents.length === 0) {
        toast.error("No students found to apply attendance to.");
        setGeneratingRange(false);
        return;
      }

      // Construct records list
      for (const student of targetStudents) {
        for (const date of validDates) {
          const status = overriddenStatuses[date] || rangeStatus;
          const remarks = overriddenRemarks[date] || rangeRemarks;
          recordsToPost.push({
            studentId: student.id,
            studentEmail: student.email || undefined,
            rollNumber: student.rollNumber || undefined,
            className: student.className || undefined,
            date: date,
            status: status,
            remarks: remarks || undefined
          });
        }
      }

      const payload = {
        records: recordsToPost
      };

      const res = await apiFetch('/attendance/bulk-import', {
        method: 'POST',
        headers: {
          'x-tenant-id': selectedSchool.id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Range entry complete! ${data.importedCount} records successfully written.`);
        setImportResult(data);
        // Reset states
        setStartDate("");
        setEndDate("");
        setRangeRemarks("");
      } else {
        toast.error(data.error || "Failed to import range records.");
      }
    } catch (err: any) {
      toast.error("Error submitting range: " + err.message);
    } finally {
      setGeneratingRange(false);
    }
  };

  const handleToggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue) 
        : [...prev, dayValue]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 capitalize font-semibold">Present</Badge>;
      case "absent":
        return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/20 capitalize font-semibold">Absent</Badge>;
      case "late":
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/20 capitalize font-semibold">Late</Badge>;
      case "half_day":
        return <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 border-sky-500/20 capitalize font-semibold">Half Day</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">Unknown</Badge>;
    }
  };

  const DAYS_OF_WEEK = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <ClipboardList className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
              Bulk Attendance Import
            </h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Streamlined platform attendance utilities for Super Admins. Select a school to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Global School Selector Box */}
      <Card className="border-none shadow-md bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5 relative overflow-hidden dark:bg-zinc-950">
        <div className="absolute top-0 right-0 size-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <Label className="text-sm font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <Building2 className="size-4" /> Selected School Context
            </Label>
            <p className="text-xs text-muted-foreground">All spreadsheet templates and range records resolve under this school.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Popover open={schoolPopoverOpen} onOpenChange={setSchoolPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  role="combobox" 
                  aria-expanded={schoolPopoverOpen}
                  className="w-full md:w-[350px] justify-between cursor-pointer capitalize bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Building2 className="size-4 text-muted-foreground shrink-0" />
                    {selectedSchool ? selectedSchool.name : "Select School"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl" align="end" side="bottom" sideOffset={4}>
                <div className="flex items-center border-b px-3 border-zinc-200 dark:border-zinc-800">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input 
                    placeholder="Search schools..." 
                    value={schoolSearchQuery}
                    onChange={(e) => setSchoolSearchQuery(e.target.value)}
                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                  />
                </div>
                <ScrollArea className="h-60 p-1">
                  {loadingSchools ? (
                    <div className="flex items-center justify-center p-4 text-sm text-muted-foreground gap-2">
                      <RefreshCw className="size-4 animate-spin text-teal-500" /> Loading schools...
                    </div>
                  ) : filteredSchools.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">No schools found matching search.</div>
                  ) : (
                    filteredSchools.map((school) => (
                      <button
                        key={school.id}
                        onClick={() => {
                          setSelectedSchool(school);
                          setSchoolPopoverOpen(false);
                          setSchoolSearchQuery("");
                        }}
                        className="flex items-center justify-between w-full text-left px-3 py-2 text-sm hover:bg-teal-500/10 dark:hover:bg-teal-500/20 rounded-md transition-colors cursor-pointer group"
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-medium text-zinc-950 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">{school.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{school.slug}</span>
                        </div>
                        {selectedSchool?.id === school.id && (
                          <Check className="h-4 w-4 text-teal-600 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Success/Import Result Banners */}
      <AnimatePresence>
        {importResult && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <Card className="border-none bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3">
                <Button variant="ghost" size="sm" onClick={() => setImportResult(null)} className="text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10">✕</Button>
              </div>
              <CardHeader className="pb-3 flex flex-row items-center gap-3">
                <div className="size-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Import Summary Completed</CardTitle>
                  <CardDescription className="text-emerald-700/80 dark:text-emerald-400/80">
                    Attendance records parsed and updated successfully inside the database.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm font-semibold">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-2">
                    <FileCheck2 className="size-4" />
                    Successfully Processed: <span className="text-lg font-extrabold">{importResult.importedCount}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 border border-zinc-500/30 flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <XCircle className="size-4 text-muted-foreground" />
                    Skipped/Ignored: <span className="text-lg font-extrabold">{importResult.skippedCount}</span>
                  </div>
                </div>

                {importResult.skippedRecords && importResult.skippedRecords.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <h4 className="text-xs uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" /> Skip Rationale Details
                    </h4>
                    <div className="max-h-36 overflow-y-auto space-y-1 bg-white/50 dark:bg-black/30 rounded-lg p-2 text-xs font-mono">
                      {importResult.skippedRecords.map((item, idx) => (
                        <div key={idx} className="flex justify-between border-b border-black/5 dark:border-white/5 py-1 last:border-none">
                          <span className="text-zinc-600 dark:text-zinc-400 truncate pr-4">
                            Row {idx + 1}: Name: {item.record?.studentName || 'N/A'} | Date: {item.record?.date || 'N/A'}
                          </span>
                          <span className="text-rose-500 font-semibold shrink-0">{item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedSchool ? (
        <Card className="border-dashed border-2 py-16 text-center shadow-none dark:bg-zinc-950">
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="size-16 rounded-full bg-teal-500/10 flex items-center justify-center animate-pulse">
              <Building2 className="size-8 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">No Active School Selected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Before uploading spreadsheets or generating date ranges, you must associate a school context using the selector above.
              </p>
            </div>
            <Button onClick={() => setSchoolPopoverOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer mt-2 shadow-md">
              <Search className="size-4 mr-2" /> Select School Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <TabsTrigger value="upload" className="rounded-lg cursor-pointer flex items-center gap-2 py-2">
              <FileSpreadsheet className="size-4" /> Spreadsheet Bulk Upload
            </TabsTrigger>
            <TabsTrigger value="range" className="rounded-lg cursor-pointer flex items-center gap-2 py-2">
              <CalendarDays className="size-4" /> Date Range Bulk Entry
            </TabsTrigger>
          </TabsList>

          {/* Sub-Tab 1: Spreadsheet Bulk Upload */}
          <TabsContent value="upload" className="space-y-6 animate-in fade-in-30 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Instructions Panel */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-sm dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="size-5 text-teal-500" /> Upload Instructions
                    </CardTitle>
                    <CardDescription>Follow these exact specifications for seamless processing.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      Platform intelligent processing reads column headers case-insensitively and maps your data automatically.
                    </p>
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase text-teal-600 dark:text-teal-400 tracking-wider">Required Columns</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li><strong className="text-zinc-900 dark:text-zinc-100">Student ID</strong> OR <strong className="text-zinc-900 dark:text-zinc-100">Student Email</strong> (Used for identification)</li>
                        <li><strong className="text-zinc-900 dark:text-zinc-100">Date</strong> (Format: <code className="bg-muted px-1 py-0.5 rounded font-mono font-semibold">YYYY-MM-DD</code>)</li>
                        <li><strong className="text-zinc-900 dark:text-zinc-100">Status</strong> (Accepts: PRESENT, ABSENT)</li>
                      </ul>

                      <h4 className="font-bold text-xs uppercase text-teal-600 dark:text-teal-400 tracking-wider pt-2">Optional Columns</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li><strong>Roll Number</strong> &amp; <strong>Class Name</strong> (Fallback identifier)</li>
                        <li><strong>Remarks</strong> (Short text note)</li>
                      </ul>
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleDownloadTemplate} 
                        disabled={downloadingTemplate}
                        variant="outline" 
                        className="w-full border-teal-500/30 dark:border-teal-500/20 hover:bg-teal-500/10 text-teal-600 dark:text-teal-400 cursor-pointer shadow-xs gap-2"
                      >
                        {downloadingTemplate ? (
                          <>
                            <RefreshCw className="size-4 animate-spin" /> Generating...
                          </>
                        ) : (
                          <>
                            <Download className="size-4" /> Prefilled Template (.xlsx)
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2">
                        Prefilled with active students in <span className="font-semibold">{selectedSchool.name}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none bg-gradient-to-br from-teal-500/10 to-transparent dark:bg-zinc-950/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                      <Info className="size-4" /> Pro tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground leading-relaxed">
                    Leave the <code className="bg-zinc-200/50 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono font-semibold">Student ID</code> column intact! It allows the database to instantly resolve your student without worrying about spelling names or email collisions.
                  </CardContent>
                </Card>
              </div>

              {/* Upload & Preview Zone */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm dark:bg-zinc-950">
                  <CardContent className="pt-6">
                    
                    {/* Drag-and-drop zone */}
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-dashed border-2 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                        isDragging 
                          ? "border-teal-500 bg-teal-500/10 scale-[0.99]" 
                          : "border-zinc-300 hover:border-teal-500 dark:border-zinc-800 dark:hover:border-teal-500/50 dark:bg-zinc-900/30 hover:bg-teal-500/5"
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                      />
                      
                      <div className="size-16 rounded-full bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <UploadCloud className="size-8 text-teal-600 dark:text-teal-400 animate-bounce" style={{ animationDuration: '3s' }} />
                      </div>
                      
                      {uploadedFile ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB | Click to swap file</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-bold">Drag and drop your spreadsheet here</p>
                          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                            Supports Excel (.xlsx, .xls) and CSV files. Make sure columns match prefilled template format.
                          </p>
                        </div>
                      )}
                    </div>

                    {validatingFile && (
                      <div className="flex items-center justify-center p-8 gap-2.5 text-sm text-muted-foreground">
                        <RefreshCw className="size-5 animate-spin text-teal-500" /> Analyzing and validating spreadsheet rows...
                      </div>
                    )}

                    {/* Parser Preview Table */}
                    {!validatingFile && parsedRows.length > 0 && (
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-base">Spreadsheet Preview</h3>
                            <p className="text-xs text-muted-foreground">
                              Showing parsed rows from <span className="font-semibold text-teal-600 dark:text-teal-400">{uploadedFile?.name}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              Valid: <span className="font-extrabold text-emerald-600">{parsedRows.filter(r => r.isValid).length}</span> / {parsedRows.length}
                            </span>
                            <Button 
                              size="sm"
                              variant="outline" 
                              onClick={() => {
                                setUploadedFile(null);
                                setParsedRows([]);
                              }}
                              className="text-rose-600 hover:bg-rose-500/10 cursor-pointer gap-1.5 h-8"
                            >
                              <Trash2 className="size-3.5" /> Clear
                            </Button>
                          </div>
                        </div>

                        {/* Interactive Table Container */}
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10">
                          <ScrollArea className="max-h-96 w-full">
                            <table className="w-full text-sm border-collapse text-left">
                              <thead className="bg-zinc-100 dark:bg-zinc-900/60 sticky top-0 font-bold border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                  <th className="p-3 text-xs uppercase tracking-wider">Student Name</th>
                                  <th className="p-3 text-xs uppercase tracking-wider">Roll/Class</th>
                                  <th className="p-3 text-xs uppercase tracking-wider">Date</th>
                                  <th className="p-3 text-xs uppercase tracking-wider">Status</th>
                                  <th className="p-3 text-xs uppercase tracking-wider">Remarks</th>
                                  <th className="p-3 text-xs uppercase tracking-wider text-right">Validation</th>
                                </tr>
                              </thead>
                              <tbody>
                                {parsedRows.map((row) => (
                                  <tr 
                                    key={row.id} 
                                    className={`border-b dark:border-zinc-800 last:border-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900/30 transition-colors ${
                                      !row.isValid ? "bg-rose-500/5 dark:bg-rose-950/5" : ""
                                    }`}
                                  >
                                    <td className="p-3">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{row.studentName || <span className="text-muted-foreground italic text-xs">Unspecified</span>}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{row.studentEmail || "No Email"}</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      {row.rollNumber && row.className ? (
                                        <span className="text-xs bg-zinc-200/50 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                                          {row.rollNumber} | {row.className}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground italic">No class details</span>
                                      )}
                                    </td>
                                    <td className="p-3 font-mono text-xs">{row.date}</td>
                                    <td className="p-3">{getStatusBadge(row.status)}</td>
                                    <td className="p-3 truncate max-w-[120px] text-xs text-muted-foreground">{row.remarks || "-"}</td>
                                    <td className="p-3 text-right">
                                      {row.isValid ? (
                                        <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-none font-medium text-[10px]">Ready</Badge>
                                      ) : (
                                        <div className="flex flex-col items-end gap-0.5">
                                          <Badge className="bg-rose-500/20 text-rose-700 dark:text-rose-400 border-none font-bold text-[10px] gap-1">
                                            <AlertTriangle className="size-3" /> Error
                                          </Badge>
                                          <div className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[150px] leading-tight text-right mt-0.5">
                                            {row.errors.join(", ")}
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </ScrollArea>
                        </div>

                        {/* Confirmation Box */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-teal-500/20 bg-teal-500/5 rounded-xl">
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm">Ready to upload records?</h4>
                            <p className="text-xs text-muted-foreground">
                              Only <span className="font-bold text-emerald-600">{parsedRows.filter(r => r.isValid).length} valid rows</span> will be imported. Invalid rows will be ignored.
                            </p>
                          </div>
                          
                          <Button
                            onClick={handleConfirmImport}
                            disabled={importingData || parsedRows.filter(r => r.isValid).length === 0}
                            className="bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md gap-2 shrink-0"
                          >
                            {importingData ? (
                              <>
                                <RefreshCw className="size-4 animate-spin" /> Importing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-4" /> Confirm &amp; Import Attendance
                              </>
                            )}
                          </Button>
                        </div>

                      </div>
                    )}

                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>

          {/* Sub-Tab 2: Student Date Range Bulk Entry */}
          <TabsContent value="range" className="space-y-6 animate-in fade-in-30 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[750px]">
              
              {/* Form Entry Column */}
              <div className="lg:col-span-1 flex flex-col min-h-0">
                <Card className="border-none shadow-sm dark:bg-zinc-950 flex-1 flex flex-col h-full min-h-0 overflow-hidden">
                  <CardHeader className="pb-3 shrink-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarDays className="size-5 text-teal-500" /> Range Configurations
                    </CardTitle>
                    <CardDescription>Setup range details for fast calendar insertion.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    {/* Toggle Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground">Target Scope</Label>
                      <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setAllStudentsMode(true)}
                          className={`py-1.5 px-3 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                            allStudentsMode 
                              ? "bg-white dark:bg-zinc-950 shadow-xs text-teal-600 dark:text-teal-400" 
                              : "text-muted-foreground hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          All School Students
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAllStudentsMode(false);
                            // Auto trigger dropdown
                            setStudentPopoverOpen(true);
                          }}
                          className={`py-1.5 px-3 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                            !allStudentsMode 
                              ? "bg-white dark:bg-zinc-950 shadow-xs text-teal-600 dark:text-teal-400" 
                              : "text-muted-foreground hover:text-zinc-900 dark:hover:text-white"
                          }`}
                        >
                          Specific Student
                        </button>
                      </div>
                    </div>                    {/* Specific Student Selector */}
                    {!allStudentsMode && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {/* Class Filter Dropdown */}
                        <div className="space-y-1.5">
                          <Label htmlFor="class-filter" className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground">Filter by Class</Label>
                          <select 
                            id="class-filter"
                            value={selectedClassId} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setSelectedClassId(val);
                              // Reset selected student if they are not in the newly selected class
                              if (selectedStudent && selectedStudent.classId !== val && val !== "all") {
                                setSelectedStudent(null);
                              }
                            }}
                            className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="all">All Classes ({uniqueClasses.length})</option>
                            {uniqueClasses.map((cls) => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Student Search and Select */}
                        <div className="space-y-1.5">
                          <Label className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground">Select Student</Label>
                          <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="outline" 
                                role="combobox"
                                aria-expanded={studentPopoverOpen}
                                className="w-full justify-between cursor-pointer capitalize bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-left text-xs"
                              >
                                <span className="flex items-center gap-2 truncate">
                                  <User className="size-4 text-muted-foreground shrink-0" />
                                  {selectedStudent ? selectedStudent.name : "Select Student..."}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full max-w-[320px] p-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl" align="start" side="bottom" sideOffset={4}>
                              <div className="flex items-center border-b px-3 border-zinc-200 dark:border-zinc-800">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <Input 
                                  placeholder="Search by name, roll, class..." 
                                  value={studentSearchQuery}
                                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                                  className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                                />
                              </div>
                              <ScrollArea className="h-48 p-1">
                                {loadingStudents ? (
                                  <div className="flex items-center justify-center p-4 text-xs text-muted-foreground gap-2">
                                    <RefreshCw className="size-3 animate-spin text-teal-500" /> Fetching student registry...
                                  </div>
                                ) : filteredStudents.length === 0 ? (
                                  <div className="p-4 text-xs text-muted-foreground text-center">No students found.</div>
                                ) : (
                                  filteredStudents.map((stu) => (
                                    <button
                                      key={stu.id}
                                      onClick={() => {
                                        setSelectedStudent(stu);
                                        setStudentPopoverOpen(false);
                                        setStudentSearchQuery("");
                                      }}
                                      className="flex items-center justify-between w-full text-left px-3 py-1.5 text-xs hover:bg-teal-500/10 dark:hover:bg-teal-500/20 rounded-md transition-colors cursor-pointer group"
                                    >
                                      <div className="flex flex-col truncate pr-2">
                                        <span className="font-medium text-zinc-950 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400">{stu.name}</span>
                                        <span className="text-[10px] text-muted-foreground truncate">
                                          Roll: {stu.rollNumber || 'N/A'} | Class: {stu.className || 'N/A'}
                                        </span>
                                      </div>
                                      {selectedStudent?.id === stu.id && (
                                        <Check className="h-3 w-3 text-teal-600 shrink-0" />
                                      )}
                                    </button>
                                  ))
                                )}
                              </ScrollArea>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </motion.div>
                    )}

                    {/* Date Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start-date" className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">Start Date</Label>
                        <DatePicker
                          date={parseDateString(startDate)}
                          onChange={(d) => setStartDate(formatDateToString(d))}
                          placeholder="Select start date"
                          className={cn(
                            "w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 transition-colors duration-250",
                            isRangeTooLarge && "border-rose-500/80 text-rose-600 dark:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-date" className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">End Date</Label>
                        <DatePicker
                          date={parseDateString(endDate)}
                          onChange={(d) => setEndDate(formatDateToString(d))}
                          placeholder="Select end date"
                          className={cn(
                            "w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9 transition-colors duration-250",
                            isRangeTooLarge && "border-rose-500/80 text-rose-600 dark:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                          )}
                        />
                      </div>
                    </div>

                    {isRangeTooLarge && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-rose-500/10 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 text-[11px] flex items-start gap-2.5 leading-relaxed font-medium shrink-0 shadow-xs"
                      >
                        <AlertTriangle className="size-4 shrink-0 mt-0.5 animate-pulse text-rose-500" />
                        <div>
                          <span className="font-extrabold block text-rose-700 dark:text-rose-300 text-xs">Date Range Exceeded (Out of Range)</span>
                          <span className="mt-0.5 block">
                            Selected range is <strong className="font-extrabold">{Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong>. The maximum system safety limit is exactly <strong className="font-extrabold">180 days (6 months)</strong> to prevent server load. Please shorten your selection.
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Weekday Selector Checkbox Grid */}
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3.5" /> Days of the Week
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isChecked = selectedDays.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => handleToggleDay(day.value)}
                              className={`flex flex-col items-center py-2 px-1 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                                isChecked 
                                  ? "border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400" 
                                  : "border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-muted-foreground"
                              }`}
                            >
                              <span>{day.label}</span>
                              <span className="mt-1">
                                {isChecked ? <CheckSquare className="size-3.5 text-teal-600 dark:text-teal-400" /> : <Square className="size-3.5 text-muted-foreground/30" />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Excludes weekdays you leave unchecked.</p>
                    </div>

                    {/* Status & Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="range-status" className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground">Range Status</Label>
                        <select 
                          id="range-status"
                          value={rangeStatus}
                          onChange={e => setRangeStatus(e.target.value)}
                          className="w-full h-9 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="range-remarks" className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground">Remarks</Label>
                        <Input 
                          id="range-remarks" 
                          placeholder="e.g. Public Holiday, Term Break" 
                          value={rangeRemarks}
                          onChange={e => setRangeRemarks(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-9"
                        />
                      </div>
                    </div>

                    {/* Submission confirmation */}
                    <div className="pt-4">
                      <Button
                        onClick={handleRangeImport}
                        disabled={generatingRange || activeRangeDatesCount === 0 || isRangeTooLarge || (!allStudentsMode && !selectedStudent)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-md gap-2"
                      >
                        {generatingRange ? (
                          <>
                            <RefreshCw className="size-4 animate-spin" /> Batch Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-4" /> Apply Attendance Range
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground mt-2">
                        Writes <span className="font-extrabold text-zinc-950 dark:text-white">{activeRangeDatesCount * (allStudentsMode ? students.length : 1)} total records</span>
                      </p>
                    </div>

                  </CardContent>
                </Card>
              </div>

              {/* Preview Timeline Grid Column */}
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <Card className="border-none shadow-sm dark:bg-zinc-950 flex-1 flex flex-col h-full min-h-0 overflow-hidden">
                  <CardHeader className="pb-3 shrink-0">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="size-5 text-teal-500" /> Active Calendar Preview
                    </CardTitle>
                    <CardDescription>Visual breakdown of dates targeted for batch insertion.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 pb-6 relative">
                    {isRangeTooLarge ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-rose-500 py-16 border border-dashed border-rose-500/30 rounded-2xl min-h-[300px] bg-rose-500/5 px-6 space-y-3">
                        <div className="size-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                          <AlertTriangle className="size-6 animate-pulse text-rose-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-rose-700 dark:text-rose-350">Date Range Exceeded (Out of Range)</p>
                          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 max-w-xs mx-auto leading-relaxed">
                            Selecting a range of <strong className="font-extrabold">{Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong> exceeds the allowed safety limit. Please select a range of <strong>180 days (6 months) or less</strong> to prevent server load.
                          </p>
                        </div>
                      </div>
                    ) : computedRangeDates.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-20 border border-dashed rounded-2xl min-h-[300px]">
                        <CalendarDays className="size-10 text-muted-foreground/30 animate-pulse mb-3" />
                        <p className="text-sm font-bold">Select Date Range</p>
                        <p className="text-xs">Setup Start and End dates to generate calendar previews here.</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col min-h-0 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl text-xs shrink-0">
                          <div>
                            Targeting: <span className="font-bold text-zinc-950 dark:text-white">{allStudentsMode ? `All ${students.length} students` : selectedStudent?.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>
                              Active Calendar Days: <span className="font-extrabold text-teal-600">{activeRangeDatesCount}</span> / {computedRangeDates.length}
                            </span>
                            <span>
                              Status to write: {getStatusBadge(rangeStatus)}
                            </span>
                          </div>
                        </div>

                        {/* Date Grid Scrollable Wrapper (Scrollbar on Left & Hidden) */}
                        <div 
                          ref={scrollRef}
                          onScroll={handleScroll}
                          className="overflow-y-auto pl-1 flex-1 min-h-0 [direction:rtl] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
                        >
                          {/* Inner Grid Container (Normal Left-to-Right Column Layout) */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 [direction:ltr] w-full">
                            <AnimatePresence>
                               {computedRangeDates.map((item, idx) => (
                                 <motion.div
                                  key={item.dateStr}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                                  onClick={() => {
                                    if (!item.isValid) return;
                                    const currentStatus = overriddenStatuses[item.dateStr] || rangeStatus;
                                    const newStatus = currentStatus === "present" ? "absent" : "present";
                                    setOverriddenStatuses(prev => ({
                                      ...prev,
                                      [item.dateStr]: newStatus
                                    }));
                                  }}
                                  className={`p-3 rounded-xl border flex flex-col items-start gap-1 justify-between transition-colors relative overflow-hidden select-none ${
                                    item.isValid 
                                      ? (overriddenStatuses[item.dateStr] || rangeStatus) === "present"
                                        ? "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 hover:bg-emerald-500/10 cursor-pointer"
                                        : "border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/10 hover:bg-rose-500/10 cursor-pointer"
                                      : "border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-zinc-900/10 text-muted-foreground line-through opacity-40"
                                  }`}
                                >
                                  {item.isValid && (
                                    <div className={`absolute top-0 right-0 size-3 rounded-bl-lg ${
                                      (overriddenStatuses[item.dateStr] || rangeStatus) === "present"
                                        ? "bg-emerald-500"
                                        : "bg-rose-500"
                                    }`} />
                                  )}
                                  <div className="text-[10px] uppercase font-bold text-zinc-400">{item.dayLabel}</div>
                                  <div className="text-xs font-bold font-mono text-zinc-950 dark:text-white">{item.dateStr}</div>
                                  <div className="mt-1 flex justify-between w-full items-center">
                                    {item.isValid ? (
                                      <>
                                        <select
                                          value={overriddenStatuses[item.dateStr] || rangeStatus}
                                          onClick={(e) => e.stopPropagation()}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            const val = e.target.value;
                                            setOverriddenStatuses(prev => ({
                                              ...prev,
                                              [item.dateStr]: val
                                            }));
                                          }}
                                          className={`text-[9px] font-bold py-0 px-1 bg-white dark:bg-zinc-900 border rounded cursor-pointer transition-colors focus:outline-none focus:ring-0 ${
                                            (overriddenStatuses[item.dateStr] || rangeStatus) === "present"
                                              ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5"
                                              : "border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/5"
                                          }`}
                                        >
                                          <option value="present" className="text-zinc-900 dark:text-white bg-white dark:bg-zinc-950">Present</option>
                                          <option value="absent" className="text-zinc-900 dark:text-white bg-white dark:bg-zinc-950">Absent</option>
                                        </select>
                                        <span className="text-[9px] text-muted-foreground max-w-[60px] truncate" title={overriddenRemarks[item.dateStr] || rangeRemarks}>
                                          {overriddenRemarks[item.dateStr] || rangeRemarks || "No remarks"}
                                        </span>
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="text-[9px] text-muted-foreground opacity-50 capitalize">
                                        Skipped
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Premium Custom Scroll Progress Circular Button */}
                    {computedRangeDates.length > 0 && (
                      <button
                        onClick={() => {
                          const element = scrollRef.current;
                          if (!element) return;
                          if (isScrolledToBottom) {
                            element.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
                          }
                        }}
                        className="absolute bottom-6 right-6 z-30 size-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-all shrink-0 active:scale-95 group"
                        title={isScrolledToBottom ? "Scroll to Top" : "Scroll to Bottom"}
                      >
                        <svg className="absolute inset-0 size-10 -rotate-90">
                          <circle
                            className="text-zinc-100 dark:text-zinc-800"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="20"
                            cy="20"
                          />
                          <circle
                            className="text-teal-500 transition-all duration-100"
                            strokeWidth="2.5"
                            strokeDasharray={100.5}
                            strokeDashoffset={100.5 - (100.5 * scrollProgress) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="16"
                            cx="20"
                            cy="20"
                          />
                        </svg>
                        <svg 
                          className={`size-4 text-teal-600 dark:text-teal-400 transition-transform duration-300 group-hover:translate-y-0.5 ${
                            isScrolledToBottom ? "rotate-180 group-hover:-translate-y-0.5" : ""
                          }`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </CardContent>
                </Card>
              </div>

            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
