import { useMutation } from '@tanstack/react-query'
import { goeyToast as toast } from 'goey-toast'
import { graphqlMutate } from '../core'
import { REQUEST_PASSWORD_RESET, CHANGE_PASSWORD } from '../queries'

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => graphqlMutate<{ requestPasswordReset: boolean }>(REQUEST_PASSWORD_RESET, { email }).then(d => d.requestPasswordReset),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (vars: { oldPassword: String; newPassword: String }) => 
      graphqlMutate<{ changePassword: boolean }>(CHANGE_PASSWORD, vars as Record<string, unknown>).then(d => d.changePassword),
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error('Failed to change password', { description: error.message })
    }
  })
}
