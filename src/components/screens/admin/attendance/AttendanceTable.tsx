"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";

interface AttendanceTableProps {
  showPeriods?: boolean;
  selectedClass: string;
  classes: any[];
  search: string;
  setSearch: (v: string) => void;
  loading: boolean;
  records: any[];
  isHistoryMode: boolean;
  statusConfig: any;
  totalPages: number;
  totalItems: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onViewProfile: (record: any) => void;
}

export function AttendanceTable({
  showPeriods = false,
  selectedClass,
  classes,
  search,
  setSearch,
  loading,
  records,
  isHistoryMode,
  statusConfig,
  totalPages,
  totalItems,
  currentPage,
  onPageChange,
  onViewProfile,
}: AttendanceTableProps) {
  return (
    <>
      <Card className="shadow-lg ">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 pb-3 sm:pb-4">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold">
              Students List
            </CardTitle>
            <CardDescription className="hidden sm:block text-xs sm:text-sm">
              {selectedClass === "all"
                ? "Showing attendance for all school students"
                : `Showing attendance records for ${classes.find((c) => c.id === selectedClass)?.name || "Class"} - ${classes.find((c) => c.id === selectedClass)?.section || ""}`}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search students…" 
              className="pl-9 w-full h-9 bg-background" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="font-bold pl-4 sm:pl-6">Student Name</TableHead>
                <TableHead className="hidden sm:table-cell font-bold w-[150px]">Class</TableHead>
                {isHistoryMode && (
                  <TableHead className="hidden sm:table-cell font-bold w-[150px]">Date</TableHead>
                )}
                {showPeriods && <TableHead className="hidden sm:table-cell">Period</TableHead>}
                <TableHead className="font-bold w-[110px] sm:w-[180px]">Status</TableHead>
                <TableHead className="hidden sm:table-cell font-bold w-[120px]">Time</TableHead>
                <TableHead className="text-right font-bold pr-4 sm:pr-6 w-[80px] sm:w-[140px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={`att-skel-${i}`}>
                      {Array(5)
                        .fill(0)
                        .map((_, j) => (
                          <TableCell key={`att-skel-cell-${j}`}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5 + Number(isHistoryMode) + Number(showPeriods)}
                    className="h-32 text-center text-muted-foreground italic"
                  >
                    No attendance records found for this selection.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow
                    key={record.id}
                    className="hover:bg-muted group transition-colors"
                  >
                    <TableCell className="font-medium pl-4 sm:pl-6">
                      {record.studentName}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell w-[150px]">
                      <Badge
                        variant="outline"
                        className="font-semibold bg-muted"
                      >
                        {record.className}
                      </Badge>
                    </TableCell>
                    {isHistoryMode && (
                      <TableCell className="hidden sm:table-cell font-medium w-[150px]" suppressHydrationWarning>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </TableCell>
                    )}
                    {showPeriods && <TableCell className="hidden sm:table-cell">
                      <span className="whitespace-nowrap">Period {record.periodNumber}</span>
                      {record.subjectName && <p className="text-xs text-muted-foreground">{record.subjectName}</p>}
                      {record.startTime && <p className="text-xs text-muted-foreground">{record.startTime}–{record.endTime}</p>}
                    </TableCell>}
                    <TableCell className="w-[110px] sm:w-[180px]">
                      <Badge
                        className={`${statusConfig[record.status]?.bg} border shadow-sm px-2 py-0.5 text-xs`}
                      >
                        <span className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
                          {statusConfig[record.status]?.icon}
                          {statusConfig[record.status]?.text}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm w-[120px]" suppressHydrationWarning>
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
                    <td className="text-right pr-4 sm:pr-6 w-[80px] sm:w-[140px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-semibold h-8 px-2.5 sm:px-3 text-xs"
                        onClick={() => onViewProfile(record)}
                      >
                        <span className="sm:hidden">View</span>
                        <span className="hidden sm:inline">View Profile</span>
                      </Button>
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION FOOTER */}
      {!loading && totalPages > 1 && (
        <div className="mt-4 pb-6">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={50}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
