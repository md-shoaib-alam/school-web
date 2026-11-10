"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import {
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Sparkles,
  Info,
  Trash2,
  ChevronDown
} from "lucide-react";
import type { ParsedRecord } from "./attendance-import-model";

interface BulkAttendanceSpreadsheetUploadTabProps {
  selectedSchool: { id: string; name: string; slug: string };
  mobileInstructionsOpen: boolean;
  setMobileInstructionsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadedFile: File | null;
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  parsedRows: ParsedRecord[];
  setParsedRows: React.Dispatch<React.SetStateAction<ParsedRecord[]>>;
  validatingFile: boolean;
  downloadingTemplate: boolean;
  importingData: boolean;
  showProgress: boolean;
  progress: number;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadTemplate: () => Promise<void>;
  handleConfirmImport: () => Promise<void>;
  getStatusBadge: (status: string) => React.ReactNode;
  AVATAR_COLORS: string[];
}

export function BulkAttendanceSpreadsheetUploadTab({
  selectedSchool,
  mobileInstructionsOpen,
  setMobileInstructionsOpen,
  isDragging,
  fileInputRef,
  uploadedFile,
  setUploadedFile,
  parsedRows,
  setParsedRows,
  validatingFile,
  downloadingTemplate,
  importingData,
  showProgress,
  progress,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  handleDownloadTemplate,
  handleConfirmImport,
  getStatusBadge,
  AVATAR_COLORS,
}: BulkAttendanceSpreadsheetUploadTabProps) {
  return (
    <TabsContent value="upload" className="space-y-5 animate-in fade-in-30 duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Instructions Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-card overflow-hidden">
            <div 
              onClick={() => setMobileInstructionsOpen((prev) => !prev)}
              className={`px-3 py-2 sm:px-4 sm:py-3 cursor-pointer lg:cursor-default flex items-center justify-between select-none transition-colors hover:bg-slate-500/[0.03] dark:hover:bg-slate-500/[0.06] lg:hover:bg-transparent ${
                mobileInstructionsOpen ? "border-b border-border/40" : "lg:border-b lg:border-border/40"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-6.5 sm:size-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <Sparkles className="size-3.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                    Upload Instructions
                  </h4>
                  <p className="hidden lg:block text-xs text-muted-foreground mt-0.5">
                    Follow these specifications for seamless processing.
                  </p>
                </div>
              </div>

              <div className="lg:hidden flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/30 text-teal-700 dark:text-teal-300 text-[11px] font-semibold shrink-0 ml-2">
                <span>{mobileInstructionsOpen ? "Hide" : "Details"}</span>
                <ChevronDown className={`size-3 transition-transform duration-200 ${mobileInstructionsOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
            <div className={`p-4 space-y-3.5 text-xs leading-relaxed text-muted-foreground ${mobileInstructionsOpen ? 'block' : 'hidden lg:block'}`}>
              <p>
                Platform intelligent processing reads column headers case-insensitively and maps your data automatically.
              </p>
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-semibold uppercase text-teal-600 dark:text-teal-400 tracking-wider">Required Columns</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li><strong className="text-foreground">Student ID</strong> OR <strong className="text-foreground">Student Email</strong> (for identification)</li>
                  <li><strong className="text-foreground">Date</strong> (Format: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">YYYY-MM-DD</code>)</li>
                  <li><strong className="text-foreground">Status</strong> (Accepts: <code className="bg-muted px-1 py-0.5 rounded text-[11px]">PRESENT</code>, <code className="bg-muted px-1 py-0.5 rounded text-[11px]">ABSENT</code>)</li>
                </ul>

                <h4 className="text-[11px] font-semibold uppercase text-teal-600 dark:text-teal-400 tracking-wider pt-1.5">Optional Columns</h4>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li><strong>Roll Number</strong> &amp; <strong>Class Name</strong> (Fallback identifier)</li>
                  <li><strong>Remarks</strong> (Short text note)</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleDownloadTemplate} 
                  disabled={downloadingTemplate}
                  variant="outline" 
                  className="w-full h-8.5 rounded-xl border-teal-500/30 dark:border-teal-500/20 hover:bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-semibold cursor-pointer shadow-2xs gap-2"
                >
                  {downloadingTemplate ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download className="size-3.5" /> Prefilled Template (.xlsx)
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground mt-1.5">
                  Prefilled with active students in <span className="font-semibold text-foreground">{selectedSchool.name}</span>
                </p>
              </div>
            </div>
          </div>

          <Card className={`rounded-xl border border-teal-200/50 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20 shadow-2xs ${mobileInstructionsOpen ? 'block' : 'hidden lg:block'}`}>
            <CardHeader className="p-3.5 pb-1">
              <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                <Info className="size-3.5" /> Pro tip
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0 text-xs text-muted-foreground leading-relaxed">
              Leave the <code className="bg-teal-100/60 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200 px-1 py-0.5 rounded font-mono text-[11px]">Student ID</code> column intact! It allows the database to instantly resolve your student without worrying about spelling or collisions.
            </CardContent>
          </Card>
        </div>

        {/* Upload & Preview Zone */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-card">
            <CardContent className="p-5">
              
              {/* Drag-and-drop zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-dashed border-2 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 scale-[0.99]" 
                    : "border-slate-200 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/40 bg-slate-50/40 dark:bg-slate-900/20 hover:bg-teal-50/20 dark:hover:bg-teal-950/10"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
                
                <div className="size-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-100/80 dark:border-teal-900/40 flex items-center justify-center mb-3 shadow-2xs text-teal-600 dark:text-teal-400">
                  <UploadCloud className="size-6" />
                </div>
                
                {uploadedFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">{uploadedFile.name}</p>
                    <p className="text-[11px] text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB • Click to swap file</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">Drag and drop your spreadsheet here</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Supports Excel (.xlsx, .xls) and CSV files. Make sure columns match the prefilled template.
                    </p>
                  </div>
                )}
              </div>

              {validatingFile && (
                <div className="flex items-center justify-center p-6 gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin text-teal-500" /> Analyzing and validating spreadsheet rows...
                </div>
              )}

              {/* Parser Preview Table */}
              {!validatingFile && parsedRows.length > 0 && (
                <div className="space-y-3.5 mt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">Spreadsheet Preview</h3>
                      <p className="text-xs text-muted-foreground">
                        Showing parsed rows from <span className="font-medium text-teal-600 dark:text-teal-400">{uploadedFile?.name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-muted-foreground">
                        Valid: <span className="font-bold text-emerald-600 dark:text-emerald-400">{parsedRows.filter(r => r.isValid).length}</span> / {parsedRows.length}
                      </span>
                      <Button 
                        size="sm"
                        variant="outline" 
                        onClick={() => {
                          setUploadedFile(null);
                          setParsedRows([]);
                        }}
                        className="text-rose-600 hover:bg-rose-500/10 cursor-pointer gap-1 h-7.5 px-2.5 rounded-lg text-xs"
                      >
                        <Trash2 className="size-3" /> Clear
                      </Button>
                    </div>
                  </div>

                  {/* Interactive Table Container */}
                  <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-xl overflow-hidden bg-card shadow-2xs">
                    <ScrollArea className="max-h-96 w-full">
                      <table className="w-full text-xs border-collapse text-left">
                        <thead className="bg-slate-50/70 dark:bg-slate-800/40 sticky top-0 border-b border-slate-200/80 dark:border-slate-800/80">
                          <tr>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground w-10">#</th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Student Name</th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Roll / Class</th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Date</th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Status</th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Remarks</th>
                            <th className="py-2.5 px-3 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground text-right">Validation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedRows.map((row, index) => {
                            const colorIndex = (row.studentName?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
                            const avatarColor = AVATAR_COLORS[colorIndex];
                            return (
                              <tr 
                                key={row.id} 
                                className={`border-b border-slate-100 dark:border-slate-800/60 last:border-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                                  !row.isValid ? "bg-rose-500/5 dark:bg-rose-950/10" : ""
                                }`}
                              >
                                <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                                  {index + 1}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${avatarColor}`}>
                                      {row.studentName?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-medium text-foreground text-xs truncate">{row.studentName || <span className="text-muted-foreground italic text-xs">Unspecified</span>}</span>
                                      <span className="text-[11px] text-muted-foreground font-mono truncate">{row.studentEmail || "No Email"}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  {row.rollNumber && row.className ? (
                                    <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-foreground px-1.5 py-0.5 rounded font-mono">
                                      {row.rollNumber} | {row.className}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground italic">No class details</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-xs text-foreground">{row.date}</td>
                                <td className="py-2.5 px-3">{getStatusBadge(row.status)}</td>
                                <td className="py-2.5 px-3 truncate max-w-[120px] text-xs text-muted-foreground">{row.remarks || "-"}</td>
                                <td className="py-2.5 px-3 text-right">
                                  {row.isValid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
                                      <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                                      Ready
                                    </span>
                                  ) : (
                                    <div className="flex flex-col items-end gap-0.5">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
                                        <AlertTriangle className="size-3" /> Error
                                      </span>
                                      <div className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[150px] leading-tight text-right mt-0.5">
                                        {row.errors.join(", ")}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>

                  {/* Confirmation Box */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-teal-500/20 bg-teal-50/30 dark:bg-teal-950/20 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-foreground">Ready to upload records?</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Only <span className="font-semibold text-emerald-600 dark:text-emerald-400">{parsedRows.filter(r => r.isValid).length} valid rows</span> will be imported. Invalid rows will be ignored.
                      </p>
                    </div>
                    
                    <Button
                      onClick={handleConfirmImport}
                      disabled={importingData || parsedRows.filter(r => r.isValid).length === 0}
                      className="h-8.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer shadow-xs gap-1.5 shrink-0"
                    >
                      {importingData ? (
                        <>
                          <RefreshCw className="size-3.5 animate-spin" /> Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-3.5" /> Confirm &amp; Import Attendance
                        </>
                      )}
                    </Button>
                  </div>

                  {showProgress && importingData && (
                    <div className="mt-3 space-y-1.5 p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl">
                      <div className="flex justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                        <span className="flex items-center gap-1.5"><RefreshCw className="size-3.5 animate-spin" /> Processing records...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-teal-500/10" indicatorClassName="bg-gradient-to-r from-teal-500 to-emerald-500" />
                    </div>
                  )}

                </div>
              )}

            </CardContent>
          </Card>
        </div>

      </div>
    </TabsContent>
  );
}
