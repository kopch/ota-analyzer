<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
        <p class="mt-2 text-gray-600">
          Manage and view your OTA analysis projects.
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

    <!-- Filters -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div class="flex items-center space-x-4">
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status-filter"
              v-model="filters.status"
              class="input-field mt-1 w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label for="sort-by" class="block text-sm font-medium text-gray-700">Sort By</label>
            <select
              id="sort-by"
              v-model="filters.sortBy"
              class="input-field mt-1 w-40"
            >
              <option value="created_at">Date Created</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search projects..."
              class="input-field pl-10 w-64"
            />
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            @click="clearFilters"
            class="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div v-if="projectsStore.loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ projectsStore.projects.length === 0 ? 'Get started by creating your first project.' : 'Try adjusting your filters.' }}
      </p>
      <div v-if="projectsStore.projects.length === 0" class="mt-6">
        <router-link to="/projects/new" class="btn-primary">
          Create Project
        </router-link>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="card-hover"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="getStatusColor(project.status)"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h3 class="text-lg font-medium text-gray-900 truncate">
                  {{ project.name }}
                </h3>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusBadgeColor(project.status)"
                >
                  {{ getStatusText(project.status) }}
                </span>
              </div>
              
              <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ formatDate(project.created_at) }}</span>
                <span v-if="project.ota_urls">
                  {{ project.ota_urls.length }} URL{{ project.ota_urls.length !== 1 ? 's' : '' }}
                </span>
                <span v-if="project.analysis_options">
                  {{ project.analysis_options.length }} analysis option{{ project.analysis_options.length !== 1 ? 's' : '' }}
                </span>
              </div>
              
              <p v-if="project.description" class="mt-2 text-sm text-gray-600 line-clamp-2">
                {{ project.description }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              v-if="project.status === 'pending'"
              @click="triggerAnalysis(project.id)"
              :disabled="projectsStore.loading"
              class="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Start Analysis
            </button>
            
            <router-link
              :to="`/projects/${project.id}`"
              class="btn-secondary text-sm"
            >
              View Details
            </router-link>
            
            <div class="relative">
              <button
                @click="toggleProjectMenu(project.id)"
                class="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              <div
                v-if="openProjectMenu === project.id"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <button
                  @click="generateShareLink(project.id)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Share Link
                </button>
                <button
                  @click="downloadReport(project.id)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Download Report
                </button>
                <hr class="my-1">
                <button
                  @click="deleteProject(project.id)"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredProjects.length }} results
      </div>
      
      <div class="flex items-center space-x-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        
        <div class="flex items-center space-x-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 text-sm rounded-md',
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'

const projectsStore = useProjectsStore()
const toast = useToast()

const filters = ref({
  status: '',
  sortBy: 'created_at',
  search: ''
})

const currentPage = ref(1)
const itemsPerPage = 10
const openProjectMenu = ref(null)

const filteredProjects = computed(() => {
  let projects = [...projectsStore.projects]
  
  // Apply status filter
  if (filters.value.status) {
    projects = projects.filter(p => p.status === filters.value.status)
  }
  
  // Apply search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    projects = projects.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    )
  }
  
  // Apply sorting
  projects.sort((a, b) => {
    switch (filters.value.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'status':
        return a.status.localeCompare(b.status)
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })
  
  return projects
})

const totalPages = computed(() => Math.ceil(filteredProjects.value.length / itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredProjects.value.length))

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
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

const clearFilters = () => {
  filters.value = {
    status: '',
    sortBy: 'created_at',
    search: ''
  }
  currentPage.value = 1
}

const toggleProjectMenu = (projectId) => {
  openProjectMenu.value = openProjectMenu.value === projectId ? null : projectId
}

const triggerAnalysis = async (projectId) => {
  try {
    await projectsStore.triggerAnalysis(projectId)
    openProjectMenu.value = null
  } catch (error) {
    // Error is handled in the store
  }
}

const generateShareLink = async (projectId) => {
  try {
    const shareLink = await projectsStore.generateShareLink(projectId)
    await navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard')
    openProjectMenu.value = null
  } catch (error) {
    toast.error('Failed to generate share link')
  }
}

const downloadReport = async (projectId) => {
  try {
    // This would trigger PDF generation and download
    toast.info('Report download started')
    openProjectMenu.value = null
  } catch (error) {
    toast.error('Failed to download report')
  }
}

const deleteProject = async (projectId) => {
  if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    try {
      await projectsStore.deleteProject(projectId)
      openProjectMenu.value = null
    } catch (error) {
      // Error is handled in the store
    }
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

// Close project menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    openProjectMenu.value = null
  }
}

onMounted(async () => {
  await projectsStore.fetchProjects()
  document.addEventListener('click', handleClickOutside)
})

watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
</script> 