import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isTrialActive = computed(() => {
    if (!user.value?.user_metadata) return false
    const trialEnd = user.value.user_metadata.trial_end
    return trialEnd ? new Date(trialEnd) > new Date() : true
  })

  const trialDaysLeft = computed(() => {
    if (!isTrialActive.value) return 0
    const trialEnd = user.value.user_metadata.trial_end
    if (!trialEnd) return 30 // Default trial period
    const daysLeft = Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24))
    return Math.max(0, daysLeft)
  })

  const initializeAuth = async () => {
    try {
      loading.value = true
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          user.value = session?.user || null
          loading.value = false
        }
      )
      
      return subscription
    } catch (err) {
      error.value = err.message
      loading.value = false
    }
  }

  const signUp = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            trial_status: 'active',
            trial_start: new Date().toISOString(),
            trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
            subscription_status: 'trial'
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signIn = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signInWithOAuth = async (provider) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (oauthError) throw oauthError
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (email) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (resetError) throw resetError
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) throw updateError
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { error: logoutError } = await supabase.auth.signOut()
      
      if (logoutError) throw logoutError
      
      user.value = null
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserMetadata = async (metadata) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: metadata
      })
      
      if (updateError) throw updateError
      
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isTrialActive,
    trialDaysLeft,
    initializeAuth,
    signUp,
    signIn,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    logout,
    updateUserMetadata
  }
}) 