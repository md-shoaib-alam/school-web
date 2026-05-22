"use client";

import { apiFetch } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Settings, Info, Save, CheckCircle2, Eye } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { useAppStore } from "@/store/use-app-store";
import { MARKSHEET_TEMPLATES, ClassicAcademy } from "./exams/marksheet-templates";
import { createRoot } from "react-dom/client";

const ALL_DAYS = [
  { key: "monday", label: "Monday", short: "Mon", icon: "📅" },
  { key: "tuesday", label: "Tuesday", short: "Tue", icon: "📝" },
  { key: "wednesday", label: "Wednesday", short: "Wed", icon: "📚" },
  { key: "thursday", label: "Thursday", short: "Thu", icon: "✏️" },
  { key: "friday", label: "Friday", short: "Fri", icon: "🎉" },
  { key: "saturday", label: "Saturday", short: "Sat", icon: "📖" },
  { key: "sunday", label: "Sunday", short: "Sun", icon: "🏫" },
] as const;

type DayKey = (typeof ALL_DAYS)[number]["key"];

const DEFAULT_WORKING_DAYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const MOCK_PREVIEW_SHEET = {
  sheet: {
    studentName: "Aarav Sharma",
    rollNumber: "2026-A104",
    schoolName: "St. Xavier's High School",
    subjects: [
      {
        subjectName: "Mathematics",
        midtermMarks: "42/50",
        finalMarks: "88/100",
        obtained: "88",
        percentage: 88,
        status: "pass" as const,
      },
      {
        subjectName: "Science",
        midtermMarks: "45/50",
        finalMarks: "92/100",
        obtained: "92",
        percentage: 92,
        status: "pass" as const,
      },
      {
        subjectName: "English Language",
        midtermMarks: "40/50",
        finalMarks: "85/100",
        obtained: "85",
        percentage: 85,
        status: "pass" as const,
      },
      {
        subjectName: "Social Science",
        midtermMarks: "38/50",
        finalMarks: "79/100",
        obtained: "79",
        percentage: 79,
        status: "pass" as const,
      },
      {
        subjectName: "Computer Applications",
        midtermMarks: "48/50",
        finalMarks: "96/100",
        obtained: "96",
        percentage: 96,
        status: "pass" as const,
      },
    ],
    totalMaxMarks: 500,
    totalObtainedMarks: 440,
    overallPercentage: 88,
    grade: "A+",
    remarks: "Excellent academic performance! Aarav demonstrates strong analytical thinking and consistency across all subjects.",
    color: "#1e3a8a",
    status: "pass" as const,
  },
  classNameStr: "Grade X",
  classSection: "A",
  academicYear: "2025–2026",
  marksheetType: "combined" as const,
};

interface TenantSettings {
  workingDays: string[];
  [key: string]: unknown;
}

export function AdminSchoolSettings() {
  const { currentTenantId } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingDays, setWorkingDays] = useState<Set<DayKey>>(
    new Set(DEFAULT_WORKING_DAYS),
  );
  const [defaultMarksheetTemplateId, setDefaultMarksheetTemplateId] = useState<string>("classic");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialSettings, setInitialSettings] = useState<TenantSettings | null>(
    null,
  );

  const fetchSettings = useCallback(async () => {
    if (!currentTenantId) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/tenant-settings");
      if (!res.ok) throw new Error();
      const data: TenantSettings = await res.json();
      setInitialSettings(data);

      if (data.workingDays && Array.isArray(data.workingDays)) {
        const validDays = data.workingDays.filter((d: string) =>
          (ALL_DAYS as readonly { key: string }[]).some((day) => day.key === d),
        ) as DayKey[];
        if (validDays.length > 0) {
          setWorkingDays(new Set(validDays));
        }
      }
      if (data.defaultMarksheetTemplateId && typeof data.defaultMarksheetTemplateId === "string") {
        setDefaultMarksheetTemplateId(data.defaultMarksheetTemplateId);
      }
    } catch {
      // Use defaults if fetch fails
      toast.error("Failed to load settings. Using default configuration.");
    } finally {
      setLoading(false);
    }
  }, [currentTenantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleDay = (dayKey: DayKey) => {
    setWorkingDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayKey)) {
        // Prevent deselecting if it's the last day
        if (next.size <= 1) {
          toast.error("At least one working day must be selected.");
          return prev;
        }
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentTenantId) return;
    if (workingDays.size === 0) {
      toast.error("At least one working day must be selected.");
      return;
    }

    setSaving(true);
    try {
      const settings = {
        ...(initialSettings || {}),
        workingDays: Array.from(workingDays),
        defaultMarksheetTemplateId,
      };

      const res = await apiFetch("/api/tenant-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save settings");
      }

      setHasChanges(false);
      setInitialSettings((prev) =>
        prev ? { ...prev, workingDays: Array.from(workingDays), defaultMarksheetTemplateId } : prev,
      );
      toast.success("School settings saved successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = workingDays.size;

  const selectedTemplate = MARKSHEET_TEMPLATES.find((t) => t.id === defaultMarksheetTemplateId) || MARKSHEET_TEMPLATES[0];
  const PreviewComponent = selectedTemplate.component || ClassicAcademy;

  const handlePreview = () => {
    const previewWindow = window.open("", "_blank");
    if (!previewWindow) {
      toast.error("Popup blocked! Please allow popups to view the marksheet preview.");
      return;
    }

    // Build standard document structure with our custom viewer styling
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>Marksheet Preview - \${selectedTemplate.name}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            color: #0f172a;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          
          /* Top bar styling */
          .toolbar {
            position: sticky;
            top: 0;
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
            color: #ffffff;
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          
          .toolbar-title {
            font-size: 0.875rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            letter-spacing: 0.025em;
          }
          
          .toolbar-badge {
            font-size: 0.7rem;
            font-weight: 600;
            color: #a78bfa;
            background-color: rgba(139, 92, 246, 0.15);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            border: 1px solid rgba(139, 92, 246, 0.2);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .toolbar-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .zoom-controls {
            display: flex;
            align-items: center;
            background-color: rgba(15, 23, 42, 0.6);
            padding: 0.25rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .zoom-btn {
            background: none;
            border: none;
            color: #94a3b8;
            padding: 0.25rem 0.625rem;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
            border-radius: 0.25rem;
            transition: all 0.15s ease;
          }
          
          .zoom-btn:hover {
            color: #ffffff;
            background-color: rgba(255, 255, 255, 0.08);
          }
          
          .zoom-btn.active {
            color: #ffffff;
            background-color: #8b5cf6;
          }
          
          .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #10b981;
            border: none;
            color: #ffffff;
            padding: 0.45rem 1rem;
            font-size: 0.75rem;
            font-weight: 700;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
          }
          
          .action-btn:hover {
            background-color: #059669;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
          }
          
          .action-btn-secondary {
            background-color: rgba(255, 255, 255, 0.1);
            color: #f1f5f9;
            box-shadow: none;
          }
          
          .action-btn-secondary:hover {
            background-color: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            box-shadow: none;
          }
          
          .viewer-container {
            flex: 1;
            overflow: auto;
            padding: 2.5rem;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            background-color: #f1f5f9;
            background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
            background-size: 16px 16px;
          }
          
          .paper-shadow {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border-radius: 0.5rem;
            background-color: #ffffff;
            overflow: hidden;
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: #ffffff !important;
            }
            .viewer-container {
              padding: 0 !important;
              background: none !important;
              overflow: visible !important;
            }
            .paper-shadow {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              width: 794px !important;
              height: 1123px !important;
              transform: none !important;
            }
            #preview-root {
              transform: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar no-print">
          <div class="toolbar-title">
            <span style="font-size: 1.1rem;">📄</span>
            <span>Marksheet Preview</span>
            <span class="toolbar-badge">\${selectedTemplate.name}</span>
          </div>
          
          <div class="toolbar-actions">
            <div class="zoom-controls">
              <button class="zoom-btn" id="zoom-out" title="Zoom Out">−</button>
              <span class="zoom-btn active" style="cursor: default;" id="zoom-label">60%</span>
              <button class="zoom-btn" id="zoom-in" title="Zoom In">+</button>
            </div>
            
            <button class="action-btn" id="print-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print
            </button>
            
            <button class="action-btn action-btn-secondary" id="close-btn">
              Close Preview
            </button>
          </div>
        </div>
        
        <div class="viewer-container">
          <div class="paper-shadow" id="paper-sheet" style="width: \${794 * 0.6}px; height: \${1123 * 0.6}px;">
            <div id="preview-root" style="width: 794px; height: 1123px; transform: scale(0.6); transform-origin: top left;">
            </div>
          </div>
        </div>
        
        <script>
          let currentZoom = 0.6;
          const paperSheet = document.getElementById('paper-sheet');
          const previewRoot = document.getElementById('preview-root');
          const zoomLabel = document.getElementById('zoom-label');
          
          function updateZoom(newZoom) {
            currentZoom = Math.min(Math.max(newZoom, 0.4), 1.5);
            previewRoot.style.transform = \`scale(\${currentZoom})\`;
            paperSheet.style.width = \`\${794 * currentZoom}px\`;
            paperSheet.style.height = \`\${1123 * currentZoom}px\`;
            zoomLabel.textContent = \`\${Math.round(currentZoom * 100)}%\`;
          }
          
          document.getElementById('zoom-in').addEventListener('click', () => {
            updateZoom(currentZoom + 0.1);
          });
          
          document.getElementById('zoom-out').addEventListener('click', () => {
            updateZoom(currentZoom - 0.1);
          });
          
          document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
          });
          
          document.getElementById('close-btn').addEventListener('click', () => {
            window.close();
          });
        </script>
      </body>
      </html>
    `);
    previewWindow.document.close();

    // Copy CSS and stylesheets
    // 1. Copy link and style elements
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach((styleNode) => {
      previewWindow.document.head.appendChild(styleNode.cloneNode(true));
    });

    // 2. Clone active stylesheets directly
    try {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if (sheet.href) {
            const link = previewWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = sheet.href;
            previewWindow.document.head.appendChild(link);
          } else if (sheet.cssRules) {
            const style = previewWindow.document.createElement('style');
            Array.from(sheet.cssRules).forEach((rule) => {
              style.appendChild(previewWindow.document.createTextNode(rule.cssText));
            });
            previewWindow.document.head.appendChild(style);
          }
        } catch (e) {
          // Ignore cross-origin rules access restrictions
        }
      });
    } catch (e) {
      console.warn("Failed to copy stylesheet rules directly:", e);
    }

    // Mount React Component
    const container = previewWindow.document.getElementById("preview-root");
    if (container) {
      const root = createRoot(container);
      root.render(<PreviewComponent {...MOCK_PREVIEW_SHEET} />);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-zinc-500 dark:text-zinc-400">
          Loading settings...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          School Settings
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure your school preferences and template defaults
        </p>
      </div>

      {/* Working Days Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Working Days</CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select the days your school holds classes and timetable schedules
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ALL_DAYS.map((day) => {
              const isSelected = workingDays.has(day.key);
              const isLastSelected = isSelected && workingDays.size <= 1;

              return (
                <label
                  key={day.key}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                    ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                    }
                    ${isLastSelected && !isSelected ? "opacity-50 pointer-events-none" : ""}
                  `}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleDay(day.key)}
                    disabled={isLastSelected && isSelected}
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {day.label}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground pt-1">
            <span>Quick Select:</span>
            <button
              type="button"
              onClick={() => {
                setWorkingDays(new Set<DayKey>(["monday", "tuesday", "wednesday", "thursday", "friday"]));
                setHasChanges(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Mon–Fri
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setWorkingDays(new Set<DayKey>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]));
                setHasChanges(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Mon–Sat
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setWorkingDays(new Set<DayKey>(["sunday", "monday", "tuesday", "wednesday", "thursday"]));
                setHasChanges(true);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Sun–Thu
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Marksheet Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-lg">
              📄
            </div>
            <div>
              <CardTitle className="text-lg">Marksheet Template Preference</CardTitle>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Choose the default marksheet template layout for both admin printing and student dashboards
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg">
            <div className="flex-1">
              <Select 
                value={defaultMarksheetTemplateId} 
                onValueChange={(val) => {
                  setDefaultMarksheetTemplateId(val);
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="w-full h-10 border-violet-200 dark:border-violet-900/50 bg-background">
                  <div className="flex items-center gap-2">
                    <Settings className="size-4 text-violet-500" />
                    <SelectValue placeholder="Choose default marksheet…" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="classic">Classic Academy</SelectItem>
                  <SelectItem value="modern">Modern Minimalist</SelectItem>
                  <SelectItem value="royal">Royal Gold Elite</SelectItem>
                  <SelectItem value="creative">Creative Compact</SelectItem>
                  <SelectItem value="cbse">CBSE Public School</SelectItem>
                  <SelectItem value="icse">ICSE Semester Convent</SelectItem>
                  <SelectItem value="stateboard">State Board Green-Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 border-violet-200 dark:border-violet-900/50 hover:bg-violet-50 dark:hover:bg-violet-950/20 text-violet-700 dark:text-violet-400 gap-1.5 font-semibold text-xs shrink-0"
              onClick={handlePreview}
            >
              <Eye className="size-4" />
              Preview Template
            </Button>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex gap-2">
            <Info className="size-4 text-violet-500 shrink-0" />
            <span>Changing this default will automatically format the report card preview under student login profiles to use this style.</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary and Save - Dashboard Page Level Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-card border border-zinc-100 dark:border-zinc-800/80 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <CheckCircle2
            className={`size-4 ${
              hasChanges ? "text-amber-500" : "text-emerald-500"
            }`}
          />
          {hasChanges ? (
            <span>You have unsaved changes.</span>
          ) : (
            <span>All changes saved.</span>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

    </div>
  );
}
