import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsAPI } from '@/lib/api'
import { useToast } from 'vue-toastification'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const toast = useToast()

  // Actions
  const fetchProjects = async () => {
    loading.value = true
    try {
      const response = await projectsAPI.getAll()
      projects.value = response.data
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      loading.value = false
    }
  }

  const fetchProject = async (id) => {
    loading.value = true
    try {
      const response = await projectsAPI.getById(id)
      currentProject.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching project:', error)
      toast.error('Failed to load project')
      return null
    } finally {
      loading.value = false
    }
  }

  const createProject = async (projectData) => {
    loading.value = true
    try {
      const response = await projectsAPI.create(projectData)
      const newProject = response.data
      projects.value.unshift(newProject)
      toast.success('Project created successfully!')
      return { success: true, project: newProject }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create project'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const updateProject = async (id, updateData) => {
    loading.value = true
    try {
      const response = await projectsAPI.update(id, updateData)
      const updatedProject = response.data
      
      // Update in projects list
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      
      // Update current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }
      
      toast.success('Project updated successfully!')
      return { success: true, project: updatedProject }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update project'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const deleteProject = async (id) => {
    loading.value = true
    try {
      await projectsAPI.delete(id)
      
      // Remove from projects list
      projects.value = projects.value.filter(p => p.id !== id)
      
      // Clear current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
      
      toast.success('Project deleted successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete project'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const triggerAnalysis = async (id) => {
    loading.value = true
    try {
      await projectsAPI.triggerAnalysis(id)
      
      // Update project status to processing
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index].status = 'processing'
      }
      
      if (currentProject.value?.id === id) {
        currentProject.value.status = 'processing'
      }
      
      toast.success('Analysis started! This may take a few minutes.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to start analysis'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  const takeScreenshot = async (url) => {
    try {
      const response = await projectsAPI.takeScreenshot(url)
      return { success: true, screenshot: response.data.screenshot }
    } catch (error) {
      console.error('Screenshot error:', error)
      return { success: false, error: 'Failed to take screenshot' }
    }
  }

  const analyzeData = async (data, type) => {
    try {
      const response = await projectsAPI.analyze(data, type)
      return { success: true, analysis: response.data.analysis }
    } catch (error) {
      console.error('Analysis error:', error)
      return { success: false, error: 'Failed to analyze data' }
    }
  }

  const generateShareLink = async (id) => {
    try {
      // Generate a share slug if not exists
      const project = projects.value.find(p => p.id === id) || currentProject.value
      if (!project) throw new Error('Project not found')
      
      if (!project.share_slug) {
        const shareSlug = `share-${id.slice(0, 8)}`
        await updateProject(id, { share_slug: shareSlug })
      }
      
      const shareUrl = `${window.location.origin}/project/${project.share_slug || `share-${id.slice(0, 8)}`}/share`
      return shareUrl
    } catch (error) {
      console.error('Share link error:', error)
      return null
    }
  }

  // Computed properties
  const getProjectById = (id) => {
    return projects.value.find(p => p.id === id)
  }

  const getProjectsByStatus = (status) => {
    return projects.value.filter(p => p.status === status)
  }

  const getCompletedProjects = () => {
    return getProjectsByStatus('completed')
  }

  const getProcessingProjects = () => {
    return getProjectsByStatus('processing')
  }

  const getPendingProjects = () => {
    return getProjectsByStatus('pending')
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    triggerAnalysis,
    takeScreenshot,
    analyzeData,
    generateShareLink,
    
    // Computed
    getProjectById,
    getProjectsByStatus,
    getCompletedProjects,
    getProcessingProjects,
    getPendingProjects
  }
}) 