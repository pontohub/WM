import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types'

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, updateUser, setLoading } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post('/api/auth/login', credentials)
      return response.data.data
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    },
    onError: (error: any) => {
      console.error('Login error:', error)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post('/api/auth/register', userData)
      return response.data.data
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    },
    onError: (error: any) => {
      console.error('Register error:', error)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout')
    },
    onSuccess: () => {
      logout()
      queryClient.clear()
      router.push('/login')
    },
    onError: () => {
      // Even if the API call fails, we should still logout locally
      logout()
      queryClient.clear()
      router.push('/login')
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: Partial<User>): Promise<User> => {
      const response = await api.put('/api/auth/profile', userData)
      return response.data.data
    },
    onSuccess: (data) => {
      updateUser(data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: any) => {
      console.error('Update profile error:', error)
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwords: { currentPassword: string; newPassword: string }) => {
      const response = await api.put('/api/auth/change-password', passwords)
      return response.data
    },
    onError: (error: any) => {
      console.error('Change password error:', error)
    },
  })

  // Verify token query
  const { data: tokenVerification, isLoading: isVerifying } = useQuery({
    queryKey: ['verify-token'],
    queryFn: async () => {
      const response = await api.get('/api/auth/verify')
      return response.data.data
    },
    enabled: !!token && isAuthenticated,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Refresh token function
  const refreshTokens = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await api.post('/api/auth/refresh', { refreshToken })
      const { user: updatedUser, accessToken, refreshToken: newRefreshToken } = response.data.data

      login(updatedUser, accessToken, newRefreshToken)
      return accessToken
    } catch (error) {
      logout()
      router.push('/login')
      throw error
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading: loginMutation.isPending || registerMutation.isPending || isVerifying,

    // Actions - return mutation objects instead of mutate functions
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    refreshTokens,

    // Mutation states
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,

    // Success states
    updateProfileSuccess: updateProfileMutation.isSuccess,
    changePasswordSuccess: changePasswordMutation.isSuccess,
  }
}

export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && !isAuthenticated) {
    router.push('/login')
  }

  return { isAuthenticated, isLoading }
}

export const useRedirectIfAuthenticated = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && isAuthenticated) {
    router.push('/dashboard')
  }

  return { isAuthenticated, isLoading }
}

