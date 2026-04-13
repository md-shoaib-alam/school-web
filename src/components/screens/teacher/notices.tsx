'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, User, Tag, Clock } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  priority: string;
  authorName: string;
  createdAt: string;
}

const ROLE_FILTER = ['all', 'teacher'];

const priorityConfig: Record<string, { bg: string; label: string }> = {
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', label: 'Urgent' },
  high: { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', label: 'High' },
  normal: { bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', label: 'Normal' },
  low: { bg: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700', label: 'Low' },
};

export function TeacherNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data: Notice[]) => {
        const filtered = Array.isArray(data)
          ? data.filter((n) => ROLE_FILTER.includes(n.targetRole))
          : [];
        setNotices(filtered);
      })
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-44" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const urgentCount = notices.filter((n) => n.priority === 'urgent').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">School Notices</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {notices.length} notices {urgentCount > 0 ? `• ${urgentCount} urgent` : ''}
          </p>
        </div>
        {urgentCount > 0 && (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 gap-1 self-start">
            <Bell className="h-3.5 w-3.5" />
            {urgentCount} Urgent
          </Badge>
        )}
      </div>

      {/* Urgent Banner */}
      {urgentCount > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Urgent Notices</span>
            </div>
            <div className="space-y-2">
              {notices
                .filter((n) => n.priority === 'urgent')
                .slice(0, 3)
                .map((n) => (
                  <div key={n.id} className="flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-3 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notice Cards */}
      {notices.length === 0 ? (
        <Card className="rounded-xl shadow-sm">
          <CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-200 dark:text-gray-700 mb-3" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notices</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your school hasn&apos;t posted any notices yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notices.map((notice) => {
            const config = priorityConfig[notice.priority] || priorityConfig.normal;
            return (
              <Card
                key={notice.id}
                className={`rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                  notice.priority === 'urgent' ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                      {notice.title}
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${config.bg}`}>
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-3 leading-relaxed">
                    {notice.content}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-800 pt-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {notice.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {notice.targetRole === 'all' ? 'Everyone' : notice.targetRole}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
