"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Calendar,
  AlertTriangle,
  Search,
  Check,
  ChevronsUpDown,
  Clock,
  CheckSquare,
  Square,
  User,
  CalendarDays,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDateToString, parseDateString, type Student } from "./attendance-import-model";

interface BulkAttendanceDateRangeTabProps {
  students: Student[];
  loadingStudents: boolean;
  filteredStudents: Student[];
  uniqueClasses: { id: string; name: string }[];
  allStudentsMode: boolean;
  setAllStudentsMode: React.Dispatch<React.SetStateAction<boolean>>;
  selectedStudent: Student | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  studentSearchQuery: string;
  setStudentSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  studentPopoverOpen: boolean;
  setStudentPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedClassId: string;
  setSelectedClassId: React.Dispatch<React.SetStateAction<string>>;
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  endDate: string;
  setEndDate: React.Dispatch<React.SetStateAction<string>>;
  rangeStatus: string;
  setRangeStatus: React.Dispatch<React.SetStateAction<string>>;
  rangeRemarks: string;
  setRangeRemarks: React.Dispatch<React.SetStateAction<string>>;
  selectedDays: number[];
  handleToggleDay: (dayValue: number) => void;
  overriddenStatuses: Record<string, string>;
  setOverriddenStatuses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  overriddenRemarks: Record<string, string>;
  computedRangeDates: { dateStr: string; dayLabel: string; isValid: boolean }[];
  activeRangeDatesCount: number;
  isRangeTooLarge: boolean;
  generatingRange: boolean;
  showProgress: boolean;
  progress: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: number;
  isScrolledToBottom: boolean;
  handleScroll: () => void;
  handleRangeImport: () => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
  AVATAR_COLORS: string[];
  DAYS_OF_WEEK: { label: string; value: number }[];
}

export function BulkAttendanceDateRangeTab({
  students,
  loadingStudents,
  filteredStudents,
  uniqueClasses,
  allStudentsMode,
  setAllStudentsMode,
  selectedStudent,
  setSelectedStudent,
  studentSearchQuery,
  setStudentSearchQuery,
  studentPopoverOpen,
  setStudentPopoverOpen,
  selectedClassId,
  setSelectedClassId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  rangeStatus,
  setRangeStatus,
  rangeRemarks,
  setRangeRemarks,
  selectedDays,
  handleToggleDay,
  overriddenStatuses,
  setOverriddenStatuses,
  overriddenRemarks,
  computedRangeDates,
  activeRangeDatesCount,
  isRangeTooLarge,
  generatingRange,
  showProgress,
  progress,
  scrollRef,
  scrollProgress,
  isScrolledToBottom,
  handleScroll,
  handleRangeImport,
  getStatusBadge,
  AVATAR_COLORS,
  DAYS_OF_WEEK,
}: BulkAttendanceDateRangeTabProps) {
  return (
    <TabsContent value="range" className="space-y-5 animate-in fade-in-30 duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:h-[720px]">
        
        {/* Form Entry Column */}
        <div className="lg:col-span-1 flex flex-col min-h-0">
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-card flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border/40 shrink-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="size-4 text-teal-600 dark:text-teal-400" /> Range Configurations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Setup range details for fast calendar insertion.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3.5 pb-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              {/* Toggle Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Target Scope</Label>
                <div className="grid grid-cols-2 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50">
                  <button
                    type="button"
                    onClick={() => setAllStudentsMode(true)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      allStudentsMode 
                        ? "bg-background shadow-xs text-foreground font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All School Students
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAllStudentsMode(false);
                      setStudentPopoverOpen(true);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      !allStudentsMode 
                        ? "bg-background shadow-xs text-foreground font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Specific Student
                  </button>
                </div>
              </div>

              {/* Specific Student Selector */}
              {!allStudentsMode && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3.5"
                >
                  {/* Class Filter Dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="class-filter" className="text-xs font-medium text-muted-foreground">Filter by Class</Label>
                    <select 
                      id="class-filter"
                      value={selectedClassId} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedClassId(val);
                        if (selectedStudent && selectedStudent.classId !== val && val !== "all") {
                          setSelectedStudent(null);
                        }
                      }}
                      className="w-full h-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 py-1 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer text-foreground"
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
                    <Label className="text-xs font-medium text-muted-foreground">Select Student</Label>
                    <Popover open={studentPopoverOpen} onOpenChange={setStudentPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          role="combobox"
                          aria-expanded={studentPopoverOpen}
                          className="w-full justify-between cursor-pointer h-8.5 rounded-xl bg-background border-slate-200 dark:border-slate-800 text-left text-xs shadow-2xs"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <User className="size-3.5 text-muted-foreground shrink-0" />
                            {selectedStudent ? selectedStudent.name : "Select Student..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full max-w-[320px] p-0 border border-slate-200 dark:border-slate-800 bg-card shadow-xl rounded-xl" align="start" side="bottom" sideOffset={4}>
                        <div className="flex items-center border-b px-3 border-border">
                          <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                          <Input 
                            placeholder="Search by name, roll, class..." 
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            className="flex h-8.5 w-full bg-transparent py-2 text-xs outline-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                          />
                        </div>
                        <ScrollArea className="h-48 p-1">
                          {loadingStudents ? (
                            <div className="flex items-center justify-center p-4 text-xs text-muted-foreground gap-2">
                              <RefreshCw className="size-3.5 animate-spin text-teal-500" /> Fetching student registry...
                            </div>
                          ) : filteredStudents.length === 0 ? (
                            <div className="p-4 text-xs text-muted-foreground text-center">No students found.</div>
                          ) : (
                            filteredStudents.map((stu) => {
                              const avatarColor = AVATAR_COLORS[(stu.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
                              return (
                                <button
                                  key={stu.id}
                                  onClick={() => {
                                    setSelectedStudent(stu);
                                    setStudentPopoverOpen(false);
                                    setStudentSearchQuery("");
                                  }}
                                  className="flex items-center justify-between w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer group"
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    <div className={`size-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${avatarColor}`}>
                                      {stu.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div className="flex flex-col truncate">
                                      <span className="font-medium text-foreground truncate">{stu.name}</span>
                                      <span className="text-[11px] text-muted-foreground truncate font-mono">
                                        Roll: {stu.rollNumber || 'N/A'} • Class: {stu.className || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedStudent?.id === stu.id && (
                                    <Check className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>
                </motion.div>
              )}

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start-date" className="text-xs font-medium text-muted-foreground block">Start Date</Label>
                  <DatePicker
                    date={parseDateString(startDate)}
                    onChange={(d) => setStartDate(formatDateToString(d))}
                    placeholder="Select start date"
                    className={cn(
                      "w-full bg-background border-slate-200 dark:border-slate-800 h-8.5 rounded-xl text-xs shadow-2xs transition-colors",
                      isRangeTooLarge && "border-rose-500/80 text-rose-600 dark:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end-date" className="text-xs font-medium text-muted-foreground block">End Date</Label>
                  <DatePicker
                    date={parseDateString(endDate)}
                    onChange={(d) => setEndDate(formatDateToString(d))}
                    placeholder="Select end date"
                    className={cn(
                      "w-full bg-background border-slate-200 dark:border-slate-800 h-8.5 rounded-xl text-xs shadow-2xs transition-colors",
                      isRangeTooLarge && "border-rose-500/80 text-rose-600 dark:text-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-500/5"
                    )}
                  />
                </div>
              </div>

              {isRangeTooLarge && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs flex items-start gap-2 leading-relaxed shadow-2xs shrink-0"
                >
                  <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-rose-500" />
                  <div>
                    <span className="font-semibold block text-rose-800 dark:text-rose-200 text-xs">Date Range Exceeded</span>
                    <span className="mt-0.5 block text-[11px] text-rose-600 dark:text-rose-400">
                      Selected range is <strong className="font-semibold">{Math.ceil(Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days</strong>. Maximum allowed limit is 180 days (6 months).
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Weekday Selector Checkbox Grid */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Days of the Week
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isChecked = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleToggleDay(day.value)}
                        className={`flex flex-col items-center py-1.5 px-1 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-150 ${
                          isChecked 
                            ? "border-teal-500/40 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-semibold shadow-2xs" 
                            : "border-slate-200 dark:border-slate-800 bg-background text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900"
                        }`}
                      >
                        <span>{day.label}</span>
                        <span className="mt-0.5">
                          {isChecked ? <CheckSquare className="size-3 text-teal-600 dark:text-teal-400" /> : <Square className="size-3 text-muted-foreground/30" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">Excludes weekdays you leave unchecked.</p>
              </div>

              {/* Status & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="range-status" className="text-xs font-medium text-muted-foreground">Range Status</Label>
                  <select 
                    id="range-status"
                    value={rangeStatus}
                    onChange={e => setRangeStatus(e.target.value)}
                    className="w-full h-8.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 py-1 text-xs shadow-2xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer text-foreground"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="range-remarks" className="text-xs font-medium text-muted-foreground">Remarks</Label>
                  <Input 
                    id="range-remarks" 
                    placeholder="e.g. Public Holiday" 
                    value={rangeRemarks}
                    onChange={e => setRangeRemarks(e.target.value)}
                    className="w-full bg-background border-slate-200 dark:border-slate-800 h-8.5 rounded-xl text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* Submission confirmation */}
              <div className="pt-2">
                <Button
                  onClick={handleRangeImport}
                  disabled={generatingRange || activeRangeDatesCount === 0 || isRangeTooLarge || (!allStudentsMode && !selectedStudent)}
                  className="w-full h-8.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer shadow-xs gap-1.5"
                >
                  {generatingRange ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" /> Batch Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-3.5" /> Apply Attendance Range
                    </>
                  )}
                </Button>

                {showProgress && generatingRange && (
                  <div className="mt-2.5 space-y-1.5 p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                      <span className="flex items-center gap-1.5"><RefreshCw className="size-3 animate-spin" /> Batch Processing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-teal-500/10" indicatorClassName="bg-gradient-to-r from-teal-500 to-emerald-500" />
                  </div>
                )}

                <p className="text-[11px] text-center text-muted-foreground mt-1.5">
                  Writes <span className="font-semibold text-foreground">{activeRangeDatesCount * (allStudentsMode ? students.length : 1)} total records</span>
                </p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Preview Timeline Grid Column */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-card flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b border-border/40 shrink-0">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-teal-600 dark:text-teal-400" /> Active Calendar Preview
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Visual breakdown of dates targeted for batch insertion.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4 pb-5 relative">
              {isRangeTooLarge ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-rose-600 dark:text-rose-400 py-12 border border-dashed border-rose-300 dark:border-rose-900/40 rounded-xl min-h-[250px] bg-rose-50/30 dark:bg-rose-950/10 px-4 space-y-2">
                  <div className="size-10 rounded-full bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="size-5 text-rose-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">Date Range Exceeded</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Selected range exceeds the allowed limit. Please select <strong>180 days or less</strong>.
                    </p>
                  </div>
                </div>
              ) : computedRangeDates.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-16 border border-dashed border-border rounded-xl min-h-[250px]">
                  <CalendarDays className="size-8 text-muted-foreground/40 animate-pulse mb-2.5" />
                  <p className="text-xs font-semibold text-foreground">Select Date Range</p>
                  <p className="text-[11px] text-muted-foreground">Setup Start and End dates to generate calendar previews here.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-xs shrink-0">
                    <div>
                      Targeting: <span className="font-semibold text-foreground">{allStudentsMode ? `All ${students.length} students` : selectedStudent?.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>
                        Active Days: <span className="font-bold text-teal-600 dark:text-teal-400">{activeRangeDatesCount}</span> / {computedRangeDates.length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        Status: {getStatusBadge(rangeStatus)}
                      </span>
                    </div>
                  </div>

                  {/* Date Grid Scrollable Wrapper */}
                  <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto pl-1 flex-1 min-h-0 [direction:rtl] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
                  >
                    {/* Inner Grid Container */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 [direction:ltr] w-full">
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
                            className={`p-2.5 rounded-xl border flex flex-col items-start gap-1 justify-between transition-colors relative overflow-hidden select-none ${
                              item.isValid 
                                ? (overriddenStatuses[item.dateStr] || rangeStatus) === "present"
                                  ? "border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/10 hover:bg-emerald-50/80 cursor-pointer shadow-2xs"
                                  : "border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/80 cursor-pointer shadow-2xs"
                                : "border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 text-muted-foreground line-through opacity-40"
                            }`}
                          >
                            {item.isValid && (
                              <div className={`absolute top-0 right-0 size-2.5 rounded-bl-md ${
                                (overriddenStatuses[item.dateStr] || rangeStatus) === "present"
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`} />
                            )}
                            <div className="text-[11px] font-medium text-muted-foreground">{item.dayLabel}</div>
                            <div className="text-xs font-bold font-mono text-foreground">{item.dateStr}</div>
                            <div className="mt-1 flex justify-between w-full items-center gap-1">
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
                                    className={`text-[11px] font-medium py-0.5 px-1.5 bg-background border rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-0 ${
                                      (overriddenStatuses[item.dateStr] || rangeStatus) === "present"
                                        ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50"
                                        : "border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-50/50"
                                    }`}
                                  >
                                    <option value="present" className="text-foreground bg-background">Present</option>
                                    <option value="absent" className="text-foreground bg-background">Absent</option>
                                  </select>
                                  <span className="text-[10px] text-muted-foreground max-w-[65px] truncate" title={overriddenRemarks[item.dateStr] || rangeRemarks}>
                                    {overriddenRemarks[item.dateStr] || rangeRemarks || "No remarks"}
                                  </span>
                                </>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground opacity-50 capitalize py-0 px-1.5 h-5">
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
                  className="absolute bottom-4 right-4 z-30 size-9 rounded-full bg-background border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center cursor-pointer transition-all shrink-0 group hover:shadow-lg"
                  title={isScrolledToBottom ? "Scroll to Top" : "Scroll to Bottom"}
                >
                  <svg className="absolute inset-0 size-9 -rotate-90">
                    <circle
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="transparent"
                      r="14"
                      cx="18"
                      cy="18"
                    />
                    <circle
                      className="text-teal-500 transition-all duration-100"
                      strokeWidth="2.5"
                      strokeDasharray={88}
                      strokeDashoffset={88 - (88 * scrollProgress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="14"
                      cx="18"
                      cy="18"
                    />
                  </svg>
                  <svg 
                    className={`size-3.5 text-teal-600 dark:text-teal-400 transition-transform duration-300 group-hover:translate-y-0.5 ${
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
  );
}
