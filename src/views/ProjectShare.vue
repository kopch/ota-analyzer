<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">A</span>
            </div>
            <span class="ml-2 text-xl font-semibold text-gray-900">OTA Analyzer</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link to="/login" class="text-primary-600 hover:text-primary-500 font-medium">
              Sign in
            </router-link>
            <router-link to="/signup" class="btn-primary">
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </div>
    
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
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
        <p class="mt-1 text-sm text-gray-500">This shared project doesn't exist or has been removed.</p>
        <div class="mt-6">
          <router-link to="/signup" class="btn-primary">
            Create Your Own Analysis
          </router-link>
        </div>
      </div>

      <!-- Project Content -->
      <div v-else class="space-y-8">
        <!-- Project Header -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">
            {{ project.name }}
          </h1>
          <p v-if="project.description" class="mt-2 text-gray-600">
            {{ project.description }}
          </p>
          <p class="mt-2 text-sm text-gray-500">
            Analysis completed on {{ formatDate(project.created_at) }}
          </p>
        </div>

        <!-- Status Banner -->
        <div
          class="card"
          :class="getStatusBannerClass(project.status)"
        >
          <div class="flex items-center justify-center">
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
            <h3 class="text-lg font-medium text-gray-900 mb-4">Get Started</h3>
            <div class="space-y-3">
              <router-link to="/signup" class="w-full btn-primary text-center block">
                Create Your Own Analysis
              </router-link>
              <router-link to="/login" class="w-full btn-secondary text-center block">
                Sign in to Your Account
              </router-link>
            </div>
          </div>
        </div>

        <!-- Analysis Results -->
        <div v-if="project.status === 'completed' && project.results" class="space-y-8">
          <h2 class="text-2xl font-bold text-gray-900 text-center">Analysis Results</h2>
          
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
          <p class="text-gray-600">This analysis is still being processed. Check back later for results.</p>
        </div>

        <!-- CTA Section -->
        <div class="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 text-center">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">
            Ready to analyze your own listings?
          </h3>
          <p class="text-gray-600 mb-6">
            Get started with your own OTA analysis project and unlock powerful insights.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/signup" class="btn-primary">
              Start Free Trial
            </router-link>
            <router-link to="/login" class="btn-secondary">
              Sign In
            </router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { format } from 'date-fns'

const route = useRoute()
const projectsStore = useProjectsStore()

const project = ref(null)
const loading = ref(true)

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
      return 'This analysis has been completed successfully. View the results below.'
    case 'processing':
      return 'This analysis is currently being processed. Check back later for results.'
    case 'pending':
      return 'This project is ready to be analyzed.'
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

onMounted(async () => {
  const shareToken = route.params.token
  if (shareToken) {
    try {
      project.value = await projectsStore.getProjectByShareToken(shareToken)
    } catch (error) {
      console.error('Failed to fetch shared project:', error)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})
</script> 