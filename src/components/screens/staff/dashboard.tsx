'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/use-app-store';
import {
  Users, Bell, Calendar, Clock, FileText, ClipboardList,
  GraduationCap, TrendingUp, CheckCircle2, AlertCircle,
  BookOpen, School
} from 'lucide-react';

export function StaffDashboard() {
  const { currentUser, currentTenantName, setCurrentScreen } = useAppStore();
  const customRoleName = currentUser?.customRole?.name;

  const stats = [
    { label: 'Total Students', value: '1,248', icon: <GraduationCap className="h-5 w-5" />, color: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400' },
    { label: 'Active Classes', value: '42', icon: <School className="h-5 w-5" />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' },
    { label: 'Pending Notices', value: '7', icon: <Bell className="h-5 w-5" />, color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
    { label: 'Attendance Rate', value: '94.2%', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' },
  ];

  const recentActivity = [
    { id: 1, title: 'Notice posted: "Mid-Term Exam Schedule"', time: '10 min ago', type: 'notice' as const },
    { id: 2, title: 'Student attendance marked for Class 10-A', time: '1 hour ago', type: 'attendance' as const },
    { id: 3, title: 'Fee payment received from Aarav Verma', time: '2 hours ago', type: 'fee' as const },
    { id: 4, title: 'Timetable updated for Science department', time: '3 hours ago', type: 'timetable' as const },
    { id: 5, title: 'New student enrolled: Priya Patel', time: 'Yesterday', type: 'enrollment' as const },
  ];

  const quickActions = [
    { label: 'View Notices', icon: <Bell className="h-5 w-5" />, screen: 'notices', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Calendar', icon: <Calendar className="h-5 w-5" />, screen: 'calendar', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Timetable', icon: <Clock className="h-5 w-5" />, screen: 'timetable', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'Assignments', icon: <FileText className="h-5 w-5" />, screen: 'assignments', color: 'bg-violet-500 hover:bg-violet-600' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Staff Meeting', date: 'Tomorrow, 10:00 AM', color: 'bg-blue-500' },
    { id: 2, title: 'Parent-Teacher Meeting', date: 'Mar 20, 2:00 PM', color: 'bg-emerald-500' },
    { id: 3, title: 'Annual Day Preparation', date: 'Mar 22, 9:00 AM', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening at {currentTenantName || 'your school'} today.
          </p>
          <div className="flex items-center gap-2 mt-2">
            {customRoleName && (
              <Badge className="bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {customRoleName}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Staff
            </Badge>
          </div>
        </div>
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
          <CardContent className="p-4">
            <div className="text-sm font-medium opacity-90">Today&apos;s Date</div>
            <div className="text-lg font-bold">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.screen}
              onClick={() => setCurrentScreen(action.screen)}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all hover:border-transparent text-left group"
            >
              <div className={`p-2 rounded-lg text-white ${action.color} transition-transform group-hover:scale-110`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="mt-0.5 shrink-0">
                    {activity.type === 'notice' && <Bell className="h-4 w-4 text-amber-500" />}
                    {activity.type === 'attendance' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {activity.type === 'fee' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'timetable' && <Clock className="h-4 w-4 text-violet-500" />}
                    {activity.type === 'enrollment' && <Users className="h-4 w-4 text-rose-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{activity.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className={`w-1.5 h-10 rounded-full ${event.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{event.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{event.date}</p>
                  </div>
                  <AlertCircle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
