'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw, Filter } from 'lucide-react';
import { leaveTypeConfig } from './leave-request';

interface LeaveFilterBarProps {
  activeTab: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  leaveTypeFilter: string;
  onLeaveTypeFilterChange: (value: string) => void;
  startDateFilter: string;
  onStartDateFilterChange: (value: string) => void;
  endDateFilter: string;
  onEndDateFilterChange: (value: string) => void;
  minFromDate: string | undefined;
  onResetFilters: () => void;
  onApplyFilters: () => void;
}

export function LeaveFilterBar({
  activeTab,
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  leaveTypeFilter,
  onLeaveTypeFilterChange,
  startDateFilter,
  onStartDateFilterChange,
  endDateFilter,
  onEndDateFilterChange,
  minFromDate,
  onResetFilters,
  onApplyFilters,
}: LeaveFilterBarProps) {
  return (
    <Card className="rounded-2xl border  bg-card p-3 sm:p-4 shadow-2xs">
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Search Box */}
        <div className="relative flex-1 min-w-[220px] sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => onSearchQueryChange(e.target.value)}
            placeholder={`Search by ${activeTab === 'student' ? 'student name or reason...' : activeTab === 'teacher' ? 'teacher name or reason...' : 'staff name or reason...'}`}
            className="pl-9 h-10 rounded-xl bg-muted  text-sm focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-36">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-10 rounded-xl bg-muted  text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Dropdown */}
        <div className="w-full sm:w-36">
          <Select value={leaveTypeFilter} onValueChange={onLeaveTypeFilterChange}>
            <SelectTrigger className="h-10 rounded-xl bg-muted  text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              {Object.keys(leaveTypeConfig).map(k => (
                <SelectItem key={k} value={k} className="capitalize">
                  {leaveTypeConfig[k]?.label || k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter (Start Date) */}
        <div className="w-full sm:w-40">
          <Input
            type="date"
            value={startDateFilter}
            min={minFromDate}
            onChange={e => onStartDateFilterChange(e.target.value)}
            placeholder="From Date"
            className="h-10 rounded-xl bg-muted  text-xs"
          />
        </div>

        {/* Date Filter (End Date) */}
        <div className="w-full sm:w-40">
          <Input
            type="date"
            value={endDateFilter}
            onChange={e => onEndDateFilterChange(e.target.value)}
            placeholder="To Date"
            className="h-10 rounded-xl bg-muted  text-xs"
          />
        </div>

        {/* Action Buttons: Reset & Filter */}
        <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="h-10 px-3.5 rounded-xl  bg-card text-foreground hover:bg-accent text-xs font-medium gap-1.5 shadow-2xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
          <Button
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-600/20 gap-1.5"
            onClick={onApplyFilters}
          >
            <Filter className="size-3.5" />
            <span>Filter</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
