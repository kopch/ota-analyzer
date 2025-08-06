<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Welcome back, {{ userFirstName }}!
        </h1>
        <p class="mt-2 text-gray-600">
          Here's what's happening with your OTA analysis projects.
        </p>
      </div>
      
      <router-link
        to="/projects/new"
        class="btn-primary inline-flex items-center px-6 py-3"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Project
      </router-link>
    </div>

    <!-- Trial Status -->
    <div v-if="authStore.isTrialActive" class="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-primary-900">
              Free Trial Active
            </h3>
            <p class="text-primary-700">
              {{ authStore.trialDaysLeft }} days remaining in your trial
            </p>
          </div>
        </div>
        <button class="btn-primary">
          Upgrade Now
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Projects</p>
            <p class="text-2xl font-semibold text-gray-900">{{ projectsStore.projectsCount }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Completed</p>
            <p class="text-2xl font-semibold text-gray-900">{{ projectsStore.completedProjects.length }}</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">In Progress</p>
            <p class="text-2xl font-semibold text-gray-900">{{ projectsStore.pendingProjects.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Projects -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Recent Projects</h2>
        <router-link to="/projects" class="text-primary-600 hover:text-primary-500 font-medium">
          View all
        </router-link>
      </div>

      <div v-if="projectsStore.loading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div v-else-if="projectsStore.projects.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first analysis project.</p>
        <div class="mt-6">
          <router-link to="/projects/new" class="btn-primary">
            Create Project
          </router-link>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="project in recentProjects"
          :key="project.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getStatusColor(project.status)"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    v-if="project.status === 'completed'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    v-else-if="project.status === 'processing'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-900">{{ project.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ formatDate(project.created_at) }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusBadgeColor(project.status)"
            >
              {{ getStatusText(project.status) }}
            </span>
            <router-link
              :to="`/projects/${project.id}`"
              class="text-primary-600 hover:text-primary-500"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="space-y-3">
          <router-link
            to="/projects/new"
            class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Analysis
          </router-link>
          <router-link
            to="/projects"
            class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View All Projects
          </router-link>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
        <div class="space-y-3">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span class="text-xs font-medium text-primary-600">1</span>
            </div>
            <p class="text-sm text-gray-600">Create your first analysis project</p>
          </div>
          <div class="flex items-start">
            <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span class="text-xs font-medium text-primary-600">2</span>
            </div>
            <p class="text-sm text-gray-600">Add OTA listing URLs to analyze</p>
          </div>
          <div class="flex items-start">
            <div class="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span class="text-xs font-medium text-primary-600">3</span>
            </div>
            <p class="text-sm text-gray-600">Review AI-powered insights and reports</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { format } from 'date-fns'

const authStore = useAuthStore()
const projectsStore = useProjectsStore()

const userFirstName = computed(() => {
  const email = authStore.user?.email || ''
  return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
})

const recentProjects = computed(() => {
  return projectsStore.projects.slice(0, 5)
})

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'processing':
      return 'bg-blue-500'
    case 'pending':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'processing':
      return 'Processing'
    case 'pending':
      return 'Pending'
    default:
      return 'Unknown'
  }
}

const formatDate = (dateString) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

onMounted(async () => {
  await projectsStore.fetchProjects()
})
</script> 