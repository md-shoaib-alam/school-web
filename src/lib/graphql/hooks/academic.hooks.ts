import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goeyToast as toast } from 'goey-toast'
import { graphqlQuery, graphqlMutate } from '../core'
import { queryKeys } from '../keys'
import { 
  SUBJECTS, CLASSES, TEACHERS, STUDENTS, PARENTS, NOTICES, FEES, ATTENDANCE, STAFF, CUSTOM_ROLES,
  CREATE_SUBJECT, UPDATE_SUBJECT, DELETE_SUBJECT,
  CREATE_CUSTOM_ROLE, UPDATE_CUSTOM_ROLE, DELETE_CUSTOM_ROLE, ASSIGN_ROLE_TO_USER,
  STAFF_ATTENDANCE, MARK_STAFF_ATTENDANCE, MARK_BULK_STAFF_ATTENDANCE
} from '../queries'
import { 
  SubjectsResponse, ClassesResponse, TeachersResponse, StudentsResponse, ParentsResponse, 
  NoticesResponse, FeesResponse, AttendanceResponse, StaffResponse, StaffAttendanceResponse
} from '../types'

export function useSubjects(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.subjects, tenantId, page, limit],
    queryFn: () => graphqlQuery<{ subjects: SubjectsResponse }>(SUBJECTS, { tenantId, page, limit }).then(d => d.subjects),
    staleTime: 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export function useClassesMin(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.classes, tenantId, page, limit],
    queryFn: () => graphqlQuery<{ classes: ClassesResponse }>(CLASSES, { tenantId, page, limit }).then(d => d.classes),
    staleTime: 60 * 1000,
  })
}

export function useTeachersMin(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.teachers, tenantId, page, limit],
    queryFn: () => graphqlQuery<{ teachers: TeachersResponse }>(TEACHERS, { tenantId, page, limit }).then(d => d.teachers),
    staleTime: 60 * 1000,
  })
}

export function useClasses(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.classes, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ classes: ClassesResponse }>(CLASSES, { tenantId, page, limit })
      return data.classes
    },
    staleTime: 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export function useTeachers(tenantId?: string, search?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.teachers, tenantId, search, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ teachers: TeachersResponse }>(TEACHERS, { tenantId, search, page, limit })
      return data.teachers
    },
    staleTime: 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })
}

export function useStudents(tenantId?: string, classId?: string, search?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.students, tenantId, classId, search, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ students: StudentsResponse }>(STUDENTS, { tenantId, classId, search, page, limit })
      return data.students
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useParents(tenantId?: string, search?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.parents, tenantId, search, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ parents: ParentsResponse }>(PARENTS, { tenantId, search, page, limit })
      return data.parents
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}


export function useNotices(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.notices, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ notices: NoticesResponse }>(NOTICES, { tenantId, page, limit })
      return data.notices
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useFees(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.fees, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ fees: FeesResponse }>(FEES, { tenantId, page, limit })
      return data.fees
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useAttendance(tenantId?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.attendance, tenantId, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ attendance: AttendanceResponse }>(ATTENDANCE, { tenantId, page, limit })
      return data.attendance
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useStaff(tenantId?: string, role?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...queryKeys.staff, tenantId, role, page, limit],
    queryFn: async () => {
      const data = await graphqlQuery<{ staff: StaffResponse }>(STAFF, { tenantId, role, page, limit })
      return data.staff
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useCustomRoles(tenantId?: string) {
  return useQuery({
    queryKey: ['custom-roles', tenantId],
    queryFn: () => graphqlQuery<{ customRoles: any[] }>(CUSTOM_ROLES, { tenantId }).then(d => d.customRoles),
    staleTime: 10 * 60 * 1000,
    enabled: !!tenantId,
  })
}

export function useCreateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => graphqlMutate<{ createSubject: any }>(CREATE_SUBJECT, { data }).then(d => d.createSubject),
    onSuccess: () => {
      toast.success('Subject created successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
    onError: (error) => toast.error('Error creating subject', { description: error.message }),
  })
}

export function useUpdateSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => graphqlMutate<{ updateSubject: any }>(UPDATE_SUBJECT, { id, data }).then(d => d.updateSubject),
    onSuccess: () => {
      toast.success('Subject updated successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
    onError: (error) => toast.error('Error updating subject', { description: error.message }),
  })
}

export function useDeleteSubject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => graphqlMutate<{ deleteSubject: boolean }>(DELETE_SUBJECT, { id }),
    onSuccess: () => {
      toast.success('Subject deleted')
      queryClient.invalidateQueries({ queryKey: queryKeys.subjects })
    },
    onError: (error) => toast.error('Error deleting subject', { description: error.message }),
  })
}

export function useCreateCustomRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: any) => graphqlMutate<{ createCustomRole: any }>(CREATE_CUSTOM_ROLE, vars).then(d => d.createCustomRole),
    onSuccess: () => {
      toast.success('Custom role created')
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] })
    },
    onError: (error) => toast.error('Error creating role', { description: error.message }),
  })
}

export function useUpdateCustomRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: any) => graphqlMutate<{ updateCustomRole: any }>(UPDATE_CUSTOM_ROLE, vars).then(d => d.updateCustomRole),
    onSuccess: () => {
      toast.success('Custom role updated')
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] })
    },
    onError: (error) => toast.error('Error updating role', { description: error.message }),
  })
}

export function useDeleteCustomRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => graphqlMutate<{ deleteCustomRole: boolean }>(DELETE_CUSTOM_ROLE, { id }),
    onSuccess: () => {
      toast.error('Role deleted permanently', {
        description: 'The custom role and its permissions have been removed.'
      })
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] })
    },
    onError: (error) => toast.error('Error deleting role', { description: error.message }),
  })
}

export function useAssignRoleToUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: any) => graphqlMutate<{ assignRoleToUser: boolean }>(ASSIGN_ROLE_TO_USER, vars),
    onSuccess: () => {
      toast.success('Role assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['staff'] })
      queryClient.invalidateQueries({ queryKey: ['all-staff'] })
      queryClient.invalidateQueries({ queryKey: ['custom-roles'] })
      queryClient.invalidateQueries({ queryKey: ['custom-roles-page'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => toast.error('Error assigning role', { description: error.message }),
  })
}

export function useStaffAttendance(vars: { tenantId?: string, role?: string, date?: string, page?: number, limit?: number }) {
  return useQuery({
    queryKey: ['staff-attendance', vars],
    queryFn: () => graphqlQuery<{ staffAttendance: StaffAttendanceResponse }>(STAFF_ATTENDANCE, vars).then(d => d.staffAttendance),
    staleTime: 60 * 1000,
  })
}

export function useMarkStaffAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => graphqlMutate<{ markStaffAttendance: boolean }>(MARK_STAFF_ATTENDANCE, { data }),
    onSuccess: () => {
      toast.success('Attendance updated')
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] })
    },
    onError: (error) => toast.error('Error updating attendance', { description: error.message }),
  })
}

export function useMarkBulkStaffAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any[]) => graphqlMutate<{ markBulkStaffAttendance: boolean }>(MARK_BULK_STAFF_ATTENDANCE, { data }),
    onSuccess: () => {
      toast.success('Attendance updated successfully')
      queryClient.invalidateQueries({ queryKey: ['staff-attendance'] })
    },
    onError: (error) => toast.error('Error updating attendance', { description: error.message }),
  })
}
