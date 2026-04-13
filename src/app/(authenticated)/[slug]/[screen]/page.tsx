'use client';

import { useParams } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';
import { AdminStudents } from '@/components/screens/admin/students';
import { AdminTeachers } from '@/components/screens/admin/teachers';
import { AdminParents } from '@/components/screens/admin/parents';
import { AdminClasses } from '@/components/screens/admin/classes';
import { AdminSubjects } from '@/components/screens/admin/subjects';
import { AdminAttendance } from '@/components/screens/admin/attendance';
import { AdminFees } from '@/components/screens/admin/fees';
import { AdminNotices } from '@/components/screens/admin/notices';
import { AdminTimetable } from '@/components/screens/admin/timetable';
import { AdminCalendar } from '@/components/screens/admin/calendar';
import { AdminReports } from '@/components/screens/admin/reports';
import { AdminSubscriptions } from '@/components/screens/admin/subscriptions';
import { AdminRoles } from '@/components/screens/admin/roles';
import { AdminStaff } from '@/components/screens/admin/staff';
import { AdminTickets } from '@/components/screens/admin/tickets';
import { AdminSchoolSettings } from '@/components/screens/admin/school-settings';
import { TeacherClasses } from '@/components/screens/teacher/my-classes';
import { TeacherAttendance } from '@/components/screens/teacher/take-attendance';
import { TeacherGrades } from '@/components/screens/teacher/grade-management';
import { TeacherAssignments } from '@/components/screens/teacher/assignments';
import { TeacherTimetable } from '@/components/screens/teacher/timetable';
import { TeacherCalendar } from '@/components/screens/teacher/calendar';
import { TeacherNotices } from '@/components/screens/teacher/notices';
import { StudentClasses } from '@/components/screens/student/my-classes';
import { StudentGrades } from '@/components/screens/student/my-grades';
import { StudentAttendance } from '@/components/screens/student/my-attendance';
import { StudentAssignments } from '@/components/screens/student/assignments';
import { StudentTimetable } from '@/components/screens/student/timetable';
import { StudentCalendar } from '@/components/screens/student/calendar';
import { StudentNotices } from '@/components/screens/student/notices';
import { StudentFees } from '@/components/screens/student/fees';
import { StudentTickets } from '@/components/screens/student/tickets';
import { ParentChildren } from '@/components/screens/parent/children';
import { ParentGrades } from '@/components/screens/parent/grades';
import { ParentAttendance } from '@/components/screens/parent/attendance';
import { ParentFees } from '@/components/screens/parent/fees';
import { ParentNotices } from '@/components/screens/parent/notices';
import { ParentSubscription } from '@/components/screens/parent/subscription';
import { ParentCalendar } from '@/components/screens/parent/calendar';
import { ParentTimetable } from '@/components/screens/parent/timetable';
import { NotFoundScreen } from '@/components/screens/error/not-found';

export default function TenantScreenDispatcher() {
  const { slug, screen } = useParams();
  const { currentUser } = useAppStore();

  if (!currentUser) return null;

  // Verify that the slug matches the user's tenant (security check)
  if (currentUser.role !== 'super_admin' && currentUser.tenantId !== slug && currentUser.tenantSlug !== slug) {
    return <NotFoundScreen />;
  }
  
  if (currentUser.role === 'admin' || currentUser.role === 'staff') {
    switch (screen) {
      case 'students': return <AdminStudents />;
      case 'teachers': return <AdminTeachers />;
      case 'parents': return <AdminParents />;
      case 'classes': return <AdminClasses />;
      case 'subjects': return <AdminSubjects />;
      case 'attendance': return <AdminAttendance />;
      case 'fees': return <AdminFees />;
      case 'notices': return <AdminNotices />;
      case 'timetable': return <AdminTimetable />;
      case 'calendar': return <AdminCalendar />;
      case 'reports': return <AdminReports />;
      case 'subscriptions': return <AdminSubscriptions />;
      case 'roles': return <AdminRoles />;
      case 'staff': return <AdminStaff />;
      case 'school-settings': return <AdminSchoolSettings />;
      case 'tickets': return <AdminTickets />;
      case 'grades': return <TeacherGrades />;
    }
  }

  if (currentUser.role === 'teacher') {
    switch (screen) {
      case 'my-classes': return <TeacherClasses />;
      case 'take-attendance': return <TeacherAttendance />;
      case 'grade-management': return <TeacherGrades />;
      case 'assignments': return <TeacherAssignments />;
      case 'timetable': return <TeacherTimetable />;
      case 'notices': return <TeacherNotices />;
      case 'calendar': return <TeacherCalendar />;
      case 'tickets': return <AdminTickets />;
    }
  }

  if (currentUser.role === 'student') {
    switch (screen) {
      case 'my-classes': return <StudentClasses />;
      case 'my-grades': return <StudentGrades />;
      case 'my-attendance': return <StudentAttendance />;
      case 'assignments': return <StudentAssignments />;
      case 'timetable': return <StudentTimetable />;
      case 'notices': return <StudentNotices />;
      case 'fees': return <StudentFees />;
      case 'tickets': return <StudentTickets />;
      case 'calendar': return <StudentCalendar />;
    }
  }

  if (currentUser.role === 'parent') {
    switch (screen) {
      case 'children': return <ParentChildren />;
      case 'grades': return <ParentGrades />;
      case 'attendance': return <ParentAttendance />;
      case 'fees': return <ParentFees />;
      case 'notices': return <ParentNotices />;
      case 'timetable': return <ParentTimetable />;
      case 'subscription': return <ParentSubscription />;
      case 'calendar': return <ParentCalendar />;
      case 'tickets': return <StudentTickets />;
    }
  }

  return <NotFoundScreen />;
}
