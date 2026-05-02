"use client";

import { useState, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { goeyToast as toast } from "goey-toast";
import { Loader2 } from "lucide-react";
import { useTenantDetail } from "@/lib/graphql/hooks";

// Sub-components
import { DetailHeader } from "./school-detail/DetailHeader";
import { DetailTabs } from "./school-detail/DetailTabs";

// Types
import { TabType } from "./school-detail/types";

interface SchoolDetailProps {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantPlan: string;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 20;

export function SchoolDetail({
  tenantId,
  tenantName,
  tenantSlug,
  tenantPlan,
  onBack,
}: SchoolDetailProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("students");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Data Fetching ──
  const { data, isLoading: loading } = useTenantDetail(tenantId);

  // ── Tab data accessors ──
  const tabData = useMemo(() => {
    if (!data) return [];
    switch (activeTab) {
      case "students": return data.students;
      case "teachers": return data.teachers;
      case "parents": return data.parents;
      case "classes": return data.classes;
      case "fees": return data.fees;
      case "attendance": return data.attendance;
      case "notices": return data.notices;
      default: return [];
    }
  }, [data, activeTab]);

  // ── Search & Pagination ──
  const filteredData = useMemo(() => {
    if (!search.trim()) return tabData;
    const q = search.toLowerCase();
    return tabData.filter((item) => {
      return Object.values(item as unknown as Record<string, unknown>).some(
        (val) => val != null && String(val).toLowerCase().includes(q)
      );
    });
  }, [tabData, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredData, currentPage]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearch("");
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // ── Export ──
  async function handleExport(dataType: string) {
    setExporting(true);
    try {
      const res = await apiFetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, dataType }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tenantSlug}_${dataType}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${dataType} exported to Excel successfully`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  }

  // ── Import ──
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenantId", tenantId);
      formData.append("dataType", activeTab);

      const res = await apiFetch("/api/import", { method: "POST", body: formData });
      const result = await res.json();
      if (result.success) {
        toast.success(`Imported ${result.imported} ${activeTab}`);
        queryClient.invalidateQueries({ queryKey: ["tenant", "detail", tenantId] });
      } else {
        toast.error(result.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-rose-600" />
        <p className="text-sm font-black text-muted-foreground animate-pulse tracking-widest uppercase">Fetching school records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DetailHeader 
        tenant={data?.tenant}
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        tenantPlan={tenantPlan}
        onBack={onBack}
      />

      <DetailTabs 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        search={search}
        setSearch={handleSearchChange}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        exporting={exporting}
        importing={importing}
        onExport={handleExport}
        onImportClick={() => importInputRef.current?.click()}
        filteredData={filteredData}
        paginatedData={paginatedData}
        totalPages={totalPages}
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
