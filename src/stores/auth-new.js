import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/lib/api'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const toast = useToast()

  // Initialize user from localStorage
  const initUser = () => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('auth_token')
    if (savedUser && token) {
      user.value = JSON.parse(savedUser)
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isTrialActive = computed(() => {
    if (!user.value?.trial_ends_at) return false
    return new Date(user.value.trial_ends_at) > new Date()
  })
  const trialDaysLeft = computed(() => {
    if (!user.value?.trial_ends_at) return 0
    const trialEnd = new Date(user.value.trial_ends_at)
    const now = new Date()
    const diffTime = trialEnd - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  })

  // Actions
  const signup = async (userData) => {
    loading.value = true
    try {
      const response = await authAPI.signup(userData)
      const { user: newUser, token } = response.data
      
      user.value = newUser
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(newUser))
      
      toast.success('Account created successfully! Welcome to OTA Analyzer.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await authAPI.login(credentials)
      const { user: userData, token } = response.data
      
      user.value = userData
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      toast.success('Welcome back!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    authAPI.logout()
    user.value = null
    toast.info('Logged out successfully')
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  // Initialize on store creation
  initUser()

  return {
    // State
    user,
    loading,
    
    // Computed
    isAuthenticated,
    isTrialActive,
    trialDaysLeft,
    
    // Actions
    signup,
    login,
    logout,
    updateUser,
    initUser
  }
}) 