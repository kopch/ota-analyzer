<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <div class="flex items-center space-x-4">
          <router-link
            to="/projects"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </router-link>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ project?.name || 'Loading...' }}
          </h1>
        </div>
        <p v-if="project?.description" class="mt-2 text-gray-600">
          {{ project.description }}
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button
          @click="downloadReport"
          :disabled="!project || project.status !== 'completed'"
          class="btn-secondary"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Report
        </button>
        
        <button
          @click="shareProject"
          :disabled="!project"
          class="btn-primary"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="projectsStore.loading" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Project Not Found -->
    <div v-else-if="!project" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
      <p class="mt-1 text-sm text-gray-500">The project you're looking for doesn't exist or you don't have access to it.</p>
      <div class="mt-6">
        <router-link to="/projects" class="btn-primary">
          Back to Projects
        </router-link>
      </div>
    </div>

    <!-- Project Content -->
    <div v-else class="space-y-8">
      <!-- Status Banner -->
      <div
        class="card"
        :class="getStatusBannerClass(project.status)"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="ml-3">
            <h3 class="text-lg font-medium">
              {{ getStatusTitle(project.status) }}
            </h3>
            <p class="text-sm">
              {{ getStatusDescription(project.status) }}
            </p>
          </div>
          <div v-if="project.status === 'pending'" class="ml-auto">
            <button
              @click="triggerAnalysis"
              :disabled="projectsStore.loading"
              class="btn-primary"
            >
              Start Analysis
            </button>
          </div>
        </div>
      </div>

      <!-- Project Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Created:</span>
              <span class="font-medium">{{ formatDate(project.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getStatusBadgeColor(project.status)"
              >
                {{ getStatusText(project.status) }}
              </span>
            </div>
            <div v-if="project.ota_urls" class="flex justify-between">
              <span class="text-gray-600">URLs Analyzed:</span>
              <span class="font-medium">{{ project.ota_urls.length }}</span>
            </div>
            <div v-if="project.analysis_options" class="flex justify-between">
              <span class="text-gray-600">Analysis Options:</span>
              <span class="font-medium">{{ project.analysis_options.length }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Analysis Options</h3>
          <div class="space-y-2">
            <div
              v-for="option in project.analysis_options"
              :key="option"
              class="flex items-center"
            >
              <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm text-gray-700">{{ getAnalysisOptionName(option) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="downloadReport"
              :disabled="project.status !== 'completed'"
              class="w-full btn-secondary text-left"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Report
            </button>
            <button
              @click="shareProject"
              class="w-full btn-secondary text-left"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share Project
            </button>
            <button
              @click="deleteProject"
              class="w-full btn-danger text-left"
            >
              <svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Project
            </button>
          </div>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-if="project.status === 'completed' && project.results" class="space-y-8">
        <h2 class="text-2xl font-bold text-gray-900">Analysis Results</h2>
        
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="card text-center">
            <div class="text-2xl font-bold text-primary-600">
              {{ project.results.averageRating?.toFixed(1) || 'N/A' }}
            </div>
            <div class="text-sm text-gray-600">Average Rating</div>
          </div>
          
          <div class="card text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ project.results.totalReviews || 'N/A' }}
            </div>
            <div class="text-sm text-gray-600">Total Reviews</div>
          </div>
          
          <div class="card text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ project.results.positiveSentiment?.toFixed(1) || 'N/A' }}%
            </div>
            <div class="text-sm text-gray-600">Positive Sentiment</div>
          </div>
          
          <div class="card text-center">
            <div class="text-2xl font-bold text-purple-600">
              {{ project.results.analyzedListings || 'N/A' }}
            </div>
            <div class="text-sm text-gray-600">Listings Analyzed</div>
          </div>
        </div>

        <!-- Charts and Visualizations -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Rating Distribution -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - Rating distribution would be displayed here
            </div>
          </div>

          <!-- Sentiment Analysis -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
            <div class="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - Sentiment analysis would be displayed here
            </div>
          </div>
        </div>

        <!-- Detailed Results -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Detailed Analysis</h3>
          <div class="space-y-6">
            <!-- Reviews Analysis -->
            <div v-if="project.results.reviewsAnalysis">
              <h4 class="text-md font-medium text-gray-900 mb-3">Reviews Analysis</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(project.results.reviewsAnalysis, null, 2) }}</pre>
              </div>
            </div>

            <!-- Images Analysis -->
            <div v-if="project.results.imagesAnalysis">
              <h4 class="text-md font-medium text-gray-900 mb-3">Images Analysis</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(project.results.imagesAnalysis, null, 2) }}</pre>
              </div>
            </div>

            <!-- Amenities Analysis -->
            <div v-if="project.results.amenitiesAnalysis">
              <h4 class="text-md font-medium text-gray-900 mb-3">Amenities Analysis</h4>
              <div class="bg-gray-50 p-4 rounded-lg">
                <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ JSON.stringify(project.results.amenitiesAnalysis, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Processing State -->
      <div v-else-if="project.status === 'processing'" class="text-center py-12">
        <svg class="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 class="text-lg font-medium text-gray-900">Analysis in Progress</h3>
        <p class="text-gray-600">We're analyzing your listings. This may take a few minutes.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()
const toast = useToast()

const project = computed(() => projectsStore.currentProject)

const getStatusBannerClass = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-50 border-green-200'
    case 'processing':
      return 'bg-blue-50 border-blue-200'
    case 'pending':
      return 'bg-yellow-50 border-yellow-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}

const getStatusTitle = (status) => {
  switch (status) {
    case 'completed':
      return 'Analysis Complete'
    case 'processing':
      return 'Analysis in Progress'
    case 'pending':
      return 'Ready to Start'
    default:
      return 'Unknown Status'
  }
}

const getStatusDescription = (status) => {
  switch (status) {
    case 'completed':
      return 'Your analysis has been completed successfully. View the results below.'
    case 'processing':
      return 'We are currently analyzing your listings. This may take a few minutes.'
    case 'pending':
      return 'Your project is ready to be analyzed. Click "Start Analysis" to begin.'
    default:
      return 'Unknown status'
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

const getAnalysisOptionName = (option) => {
  const optionNames = {
    reviews: 'Reviews & Ratings',
    images: 'Images & Visual Content',
    amenities: 'Amenities & Features',
    pricing: 'Pricing Analysis',
    location: 'Location Insights',
    competition: 'Competitive Analysis'
  }
  return optionNames[option] || option
}

const formatDate = (dateString) => {
  return format(new Date(dateString), 'MMM d, yyyy')
}

const triggerAnalysis = async () => {
  try {
    await projectsStore.triggerAnalysis(project.value.id)
  } catch (error) {
    // Error is handled in the store
  }
}

const downloadReport = async () => {
  try {
    // This would trigger PDF generation and download
    toast.info('Report download started')
  } catch (error) {
    toast.error('Failed to download report')
  }
}

const shareProject = async () => {
  try {
    const shareLink = await projectsStore.generateShareLink(project.value.id)
    await navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard')
  } catch (error) {
    toast.error('Failed to generate share link')
  }
}

const deleteProject = async () => {
  if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    try {
      await projectsStore.deleteProject(project.value.id)
      router.push('/projects')
    } catch (error) {
      // Error is handled in the store
    }
  }
}

onMounted(async () => {
  const projectId = route.params.id
  if (projectId) {
    await projectsStore.fetchProject(projectId)
  }
})
</script> 