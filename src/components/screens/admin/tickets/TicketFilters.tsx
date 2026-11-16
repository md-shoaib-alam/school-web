"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { TICKET_CATEGORIES } from "./constants";

interface TicketFiltersProps {
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
}

export function TicketFilters({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
}: TicketFiltersProps) {
  return (
    <div className="space-y-4">
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-muted/70 p-1 border border-border rounded-xl h-10">
          <TabsTrigger 
            value="all" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs hover:text-foreground font-semibold cursor-pointer transition-all px-3.5 text-xs"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="open" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs hover:text-foreground font-semibold cursor-pointer transition-all px-3.5 text-xs"
          >
            Open
          </TabsTrigger>
          <TabsTrigger 
            value="in_progress" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs hover:text-foreground font-semibold cursor-pointer transition-all px-3.5 text-xs"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger 
            value="on_hold" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs hover:text-foreground font-semibold cursor-pointer transition-all px-3.5 text-xs"
          >
            On Hold
          </TabsTrigger>
          <TabsTrigger 
            value="resolved" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs hover:text-foreground font-semibold cursor-pointer transition-all px-3.5 text-xs"
          >
            Resolved
          </TabsTrigger>
          <TabsTrigger 
            value="closed" 
            className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-xs hover:text-foreground font-semibold cursor-pointer transition-all px-3.5 text-xs"
          >
            Closed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            className="pl-9 rounded-xl border-border bg-card shadow-xs focus-visible:ring-blue-500/30 focus-visible:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40 rounded-xl border-border bg-card shadow-xs focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border bg-popover">
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl border-border bg-card shadow-xs focus-visible:ring-blue-500/30 focus-visible:border-blue-500">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            {TICKET_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
