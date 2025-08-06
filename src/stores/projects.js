import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, TABLES } from '@/lib/supabase'
import { useToast } from 'vue-toastification'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  const projectsCount = computed(() => projects.value.length)
  const completedProjects = computed(() => 
    projects.value.filter(p => p.status === 'completed')
  )
  const pendingProjects = computed(() => 
    projects.value.filter(p => p.status === 'pending')
  )

  const fetchProjects = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      projects.value = data || []
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch projects')
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: createError } = await supabase
        .from(TABLES.PROJECTS)
        .insert([{
          name: projectData.name,
          user_id: projectData.userId,
          status: 'pending',
          ota_urls: projectData.otaUrls,
          analysis_options: projectData.analysisOptions,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (createError) throw createError
      
      projects.value.unshift(data)
      currentProject.value = data
      
      toast.success('Project created successfully')
      return data
    } catch (err) {
      error.value = err.message
      toast.error('Failed to create project')
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProjectStatus = async (projectId, status, results = null) => {
    try {
      const updateData = { status, updated_at: new Date().toISOString() }
      if (results) {
        updateData.results = results
      }
      
      const { data, error: updateError } = await supabase
        .from(TABLES.PROJECTS)
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = data
      }
      
      if (currentProject.value?.id === projectId) {
        currentProject.value = data
      }
      
      return data
    } catch (err) {
      error.value = err.message
      toast.error('Failed to update project')
      throw err
    }
  }

  const fetchProject = async (projectId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (fetchError) throw fetchError
      
      currentProject.value = data
      return data
    } catch (err) {
      error.value = err.message
      toast.error('Failed to fetch project')
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (projectId) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: deleteError } = await supabase
        .from(TABLES.PROJECTS)
        .delete()
        .eq('id', projectId)
      
      if (deleteError) throw deleteError
      
      projects.value = projects.value.filter(p => p.id !== projectId)
      
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
      
      toast.success('Project deleted successfully')
    } catch (err) {
      error.value = err.message
      toast.error('Failed to delete project')
      throw err
    } finally {
      loading.value = false
    }
  }

  const triggerAnalysis = async (projectId) => {
    try {
      loading.value = true
      error.value = null
      
      // Update project status to processing
      await updateProjectStatus(projectId, 'processing')
      
      // Call n8n webhook to trigger analysis
      const response = await fetch('/api/trigger-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to trigger analysis')
      }
      
      toast.success('Analysis started successfully')
    } catch (err) {
      error.value = err.message
      await updateProjectStatus(projectId, 'pending')
      toast.error('Failed to start analysis')
      throw err
    } finally {
      loading.value = false
    }
  }

  const generateShareLink = async (projectId) => {
    try {
      const { data, error: updateError } = await supabase
        .from(TABLES.PROJECTS)
        .update({
          share_token: crypto.randomUUID(),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select('share_token')
        .single()
      
      if (updateError) throw updateError
      
      return `${window.location.origin}/project/${data.share_token}/share`
    } catch (err) {
      error.value = err.message
      toast.error('Failed to generate share link')
      throw err
    }
  }

  const getProjectByShareToken = async (shareToken) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from(TABLES.PROJECTS)
        .select('*')
        .eq('share_token', shareToken)
        .single()
      
      if (fetchError) throw fetchError
      
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    projects,
    currentProject,
    loading,
    error,
    projectsCount,
    completedProjects,
    pendingProjects,
    fetchProjects,
    createProject,
    updateProjectStatus,
    fetchProject,
    deleteProject,
    triggerAnalysis,
    generateShareLink,
    getProjectByShareToken
  }
}) 