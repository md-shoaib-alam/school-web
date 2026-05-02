import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableRow,
  TableHeader,
} from "@/components/ui/table";
import { 
  Download, 
  Upload, 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from "lucide-react";
import { TabType, TAB_CONFIG } from "./types";
import { renderTableHeaders, renderTableCells } from "./TabRenderers";

interface DetailTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  search: string;
  setSearch: (val: string) => void;
  currentPage: number;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
  exporting: boolean;
  importing: boolean;
  onExport: (type: string) => void;
  onImportClick: () => void;
  filteredData: any[];
  paginatedData: any[];
  totalPages: number;
}

export function DetailTabs({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  currentPage,
  setCurrentPage,
  exporting,
  importing,
  onExport,
  onImportClick,
  filteredData,
  paginatedData,
  totalPages,
}: DetailTabsProps) {
  
  function getPaginationRange(current: number, total: number): (number | "ellipsis")[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "ellipsis")[] = [1];
    if (current > 3) pages.push("ellipsis");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("ellipsis");
    pages.push(total);
    return pages;
  }

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden">
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          {/* Header Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="h-11 p-1 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                {TAB_CONFIG.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="gap-2 px-5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm rounded-lg transition-all"
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport(activeTab)}
                disabled={exporting || filteredData.length === 0}
                className="h-10 text-[11px] font-black uppercase tracking-widest px-4 border-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onImportClick}
                disabled={importing}
                className="h-10 text-[11px] font-black uppercase tracking-widest px-4 border-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import CSV
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search in ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}...`}
              className="pl-12 h-12 rounded-xl border-2 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Filter className="h-4 w-4 text-muted-foreground opacity-50" />
            </div>
          </div>

          {/* Table Content */}
          {TAB_CONFIG.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              {filteredData.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
                  <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-muted-foreground/30">
                    {tab.icon}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                    No {tab.label.toLowerCase()} found
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 font-medium max-w-[280px] mx-auto leading-relaxed">
                    {search
                      ? `We couldn't find any results matching "${search}". Try a different term.`
                      : `There is no ${tab.label.toLowerCase()} data available for this school yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border-2 border-gray-50 dark:border-gray-900 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-transparent">
                            {renderTableHeaders(activeTab)}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.map((item, idx) => (
                            <TableRow
                              key={item.id || idx}
                              className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors border-b last:border-none"
                            >
                              {renderTableCells(activeTab, item)}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-900">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      Showing <span className="text-rose-600">{(currentPage - 1) * 20 + 1}</span> to <span className="text-rose-600">{Math.min(currentPage * 20, filteredData.length)}</span> of {filteredData.length} records
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-1 px-1">
                        {getPaginationRange(currentPage, totalPages).map((page, idx) =>
                          page === "ellipsis" ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground font-black">...</span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "ghost"}
                              size="sm"
                              className={`h-9 w-9 rounded-xl font-black text-xs ${currentPage === page ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 dark:shadow-none' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          )
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
