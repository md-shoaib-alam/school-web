'use client';

export type TabType = 'all' | 'upcoming' | 'in_progress' | 'completed' | 'draft';

interface ActiveExamsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All Exams' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft', label: 'Drafts' },
];

export function ActiveExamsTabs({ activeTab, onTabChange }: ActiveExamsTabsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-6 border-b border-border/80 pb-px overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
