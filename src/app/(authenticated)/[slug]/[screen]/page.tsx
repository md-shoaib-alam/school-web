'use client';

import { useParams } from 'next/navigation';
import { useAppStore } from '@/store/use-app-store';
import dynamic from 'next/dynamic';

const LoadingScreen = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="animate-spin h-8 w-8 border-4 border-rose-500 border-t-transparent rounded-full" />
  </div>
);

const TeacherDashboard = dynamic(() => import('@/components/screens/teacher/dashboard').then(m => m.TeacherDashboard), { loading: LoadingScreen });
const StudentDashboard = dynamic(() => import('@/components/screens/student/dashboard').then(m => m.StudentDashboard), { loading: LoadingScreen });
const ParentDashboard = dynamic(() => import('@/components/screens/parent/dashboard').then(m => m.ParentDashboard), { loading: LoadingScreen });
const StaffDashboard = dynamic(() => import('@/components/screens/staff/dashboard').then(m => m.StaffDashboard), { loading: LoadingScreen });
const AdminDashboard = dynamic(() => import('@/components/screens/admin/dashboard').then(m => m.AdminDashboard), { loading: LoadingScreen });
const AdminStudents = dynamic(() => import('@/components/screens/admin/students').then(m => m.AdminStudents), { loading: LoadingScreen });
const AdminTeachers = dynamic(() => import('@/components/screens/admin/teachers').then(m => m.AdminTeachers), { loading: LoadingScreen });
const AdminParents = dynamic(() => import('@/components/screens/admin/parents').then(m => m.AdminParents), { loading: LoadingScreen });
const AdminClasses = dynamic(() => import('@/components/screens/admin/classes').then(m => m.AdminClasses), { loading: LoadingScreen });
const AdminSubjects = dynamic(() => import('@/components/screens/admin/subjects').then(m => m.AdminSubjects), { loading: LoadingScreen });
const AdminAttendance = dynamic(() => import('@/components/screens/admin/attendance').then(m => m.AdminAttendance), { loading: LoadingScreen });
const AdminFees = dynamic(() => import('@/components/screens/admin/fees').then(m => m.AdminFees), { loading: LoadingScreen });
const AdminNotices = dynamic(() => import('@/components/screens/admin/notices').then(m => m.AdminNotices), { loading: LoadingScreen });
const AdminTimetable = dynamic(() => import('@/components/screens/admin/timetable').then(m => m.AdminTimetable), { loading: LoadingScreen });
const AdminCalendar = dynamic(() => import('@/components/screens/admin/calendar').then(m => m.AdminCalendar), { loading: LoadingScreen });
const AdminReports = dynamic(() => import('@/components/screens/admin/reports').then(m => m.AdminReports), { loading: LoadingScreen });
const AdminRoles = dynamic(() => import('@/components/screens/admin/roles').then(m => m.AdminRoles), { loading: LoadingScreen });
const AdminStaff = dynamic(() => import('@/components/screens/admin/staff').then(m => m.AdminStaff), { loading: LoadingScreen });
const AdminTickets = dynamic(() => import('@/components/screens/admin/tickets').then(m => m.AdminTickets), { loading: LoadingScreen });
const AdminSchoolSettings = dynamic(() => import('@/components/screens/admin/school-settings').then(m => m.AdminSchoolSettings), { loading: LoadingScreen });
const AdminPromotions = dynamic(() => import('@/components/screens/admin/promotions').then(m => m.AdminPromotions), { loading: LoadingScreen });
const AdminCertificates = dynamic(() => import('@/components/screens/admin/certificates').then(m => m.AdminCertificates), { loading: LoadingScreen });
const AdminLeaves = dynamic(() => import('@/components/screens/admin/leaves').then(m => m.AdminLeaves), { loading: LoadingScreen });
const StaffAttendance = dynamic(() => import('@/components/screens/admin/staff-attendance').then(m => m.StaffAttendance), { loading: LoadingScreen });
const AdminExams = dynamic(() => import('@/components/screens/admin/exams').then(m => m.AdminExams), { loading: LoadingScreen });
const AdminAdmitCards = dynamic(() => import('@/components/screens/admin/admit-cards').then(m => m.AdminAdmitCards), { loading: LoadingScreen });

const TeacherClasses = dynamic(() => import('@/components/screens/teacher/my-classes').then(m => m.TeacherClasses), { loading: LoadingScreen });
const TeacherAttendance = dynamic(() => import('@/components/screens/teacher/take-attendance').then(m => m.TeacherAttendance), { loading: LoadingScreen });
const TeacherGrades = dynamic(() => import('@/components/screens/teacher/grade-management').then(m => m.TeacherGrades), { loading: LoadingScreen });
const TeacherAssignments = dynamic(() => import('@/components/screens/teacher/assignments').then(m => m.TeacherAssignments), { loading: LoadingScreen });
const TeacherTimetable = dynamic(() => import('@/components/screens/teacher/timetable').then(m => m.TeacherTimetable), { loading: LoadingScreen });
const TeacherCalendar = dynamic(() => import('@/components/screens/teacher/calendar').then(m => m.TeacherCalendar), { loading: LoadingScreen });
const TeacherNotices = dynamic(() => import('@/components/screens/teacher/notices').then(m => m.TeacherNotices), { loading: LoadingScreen });

const StudentClasses = dynamic(() => import('@/components/screens/student/my-classes').then(m => m.StudentClasses), { loading: LoadingScreen });
const StudentGrades = dynamic(() => import('@/components/screens/student/my-grades').then(m => m.StudentGrades), { loading: LoadingScreen });
const StudentAttendance = dynamic(() => import('@/components/screens/student/my-attendance').then(m => m.StudentAttendance), { loading: LoadingScreen });
const StudentAssignments = dynamic(() => import('@/components/screens/student/assignments').then(m => m.StudentAssignments), { loading: LoadingScreen });
const StudentTimetable = dynamic(() => import('@/components/screens/student/timetable').then(m => m.StudentTimetable), { loading: LoadingScreen });
const StudentCalendar = dynamic(() => import('@/components/screens/student/calendar').then(m => m.StudentCalendar), { loading: LoadingScreen });
const StudentNotices = dynamic(() => import('@/components/screens/student/notices').then(m => m.StudentNotices), { loading: LoadingScreen });
const StudentFees = dynamic(() => import('@/components/screens/student/fees').then(m => m.StudentFees), { loading: LoadingScreen });
const StudentTickets = dynamic(() => import('@/components/screens/student/tickets').then(m => m.StudentTickets), { loading: LoadingScreen });

const ParentChildren = dynamic(() => import('@/components/screens/parent/children').then(m => m.ParentChildren), { loading: LoadingScreen });
const ParentGrades = dynamic(() => import('@/components/screens/parent/grades').then(m => m.ParentGrades), { loading: LoadingScreen });
const ParentAttendance = dynamic(() => import('@/components/screens/parent/attendance').then(m => m.ParentAttendance), { loading: LoadingScreen });
const ParentFees = dynamic(() => import('@/components/screens/parent/fees').then(m => m.ParentFees), { loading: LoadingScreen });
const ParentNotices = dynamic(() => import('@/components/screens/parent/notices').then(m => m.ParentNotices), { loading: LoadingScreen });
const ParentSubscription = dynamic(() => import('@/components/screens/parent/subscription').then(m => m.ParentSubscription), { loading: LoadingScreen });
const ParentCalendar = dynamic(() => import('@/components/screens/parent/calendar').then(m => m.ParentCalendar), { loading: LoadingScreen });
const ParentTimetable = dynamic(() => import('@/components/screens/parent/timetable').then(m => m.ParentTimetable), { loading: LoadingScreen });

const NotFoundScreen = dynamic(() => import('@/components/screens/error/not-found').then(m => m.NotFoundScreen));

export default function TenantScreenDispatcher() {
  const { slug, screen } = useParams();
  const { currentUser } = useAppStore();

  if (!currentUser) return null;

  // Verify that the slug matches the user's tenant (security check)
  if (currentUser.role !== 'super_admin' && currentUser.tenantId !== slug && currentUser.tenantSlug !== slug) {
    return <NotFoundScreen />;
  }
  
  if (currentUser.role === 'super_admin' || currentUser.role === 'admin' || currentUser.role === 'staff') {
    switch (screen) {
      case 'dashboard': return currentUser.role === 'staff' ? <StaffDashboard /> : <AdminDashboard />;
      case 'students': return <AdminStudents />;
      case 'teachers': return <AdminTeachers />;
      case 'parents': return <AdminParents />;
      case 'classes': return <AdminClasses />;
      case 'subjects': return <AdminSubjects />;
      case 'attendance': return <AdminAttendance />;
      case 'fees':
      case 'fee-categories':
      case 'fee-concessions':
      case 'make-payment':
      case 'check-receipt':
      case 'fee-status':
      case 'check-payments':
      case 'transport-fee':
        return <AdminFees />;
      case 'notices': return <AdminNotices />;
      case 'timetable': return <AdminTimetable />;
      case 'calendar': return <AdminCalendar />;
      case 'reports': return <AdminReports />;
      case 'roles': return <AdminRoles />;
      case 'staff': return <AdminStaff />;
      case 'school-settings': return <AdminSchoolSettings />;
      case 'tickets': return <AdminTickets />;
      case 'promotions': return <AdminPromotions />;
      case 'certificates': return <AdminCertificates />;
      case 'leaves': return <AdminLeaves />;
      case 'grades': return <TeacherGrades />;
      case 'staff-attendance': return <StaffAttendance />;
      case 'exams': return <AdminExams />;
      case 'admit-cards': return <AdminAdmitCards />;
    }
  }

  if (currentUser.role === 'teacher') {
    switch (screen) {
      case 'dashboard': return <TeacherDashboard />;
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
      case 'dashboard': return <StudentDashboard />;
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
      case 'dashboard': return <ParentDashboard />;
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
