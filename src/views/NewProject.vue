<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Create New Analysis</h1>
      <p class="mt-2 text-gray-600">
        Set up your OTA listing analysis project in a few simple steps.
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex items-center"
        >
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
            :class="getStepClass(index)"
          >
            <span v-if="currentStep > index + 1">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span
            class="ml-2 text-sm font-medium"
            :class="getStepTextClass(index)"
          >
            {{ step.title }}
          </span>
          <div
            v-if="index < steps.length - 1"
            class="ml-4 w-16 h-0.5 bg-gray-300"
            :class="{ 'bg-primary-600': currentStep > index + 1 }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="card">
      <!-- Step 1: Project Details -->
      <div v-if="currentStep === 1" class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
          <div class="space-y-4">
            <div>
              <label for="projectName" class="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                id="projectName"
                v-model="form.name"
                type="text"
                required
                class="input-field mt-1"
                placeholder="Enter a name for your project"
              />
            </div>
            <div>
              <label for="projectDescription" class="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                id="projectDescription"
                v-model="form.description"
                rows="3"
                class="input-field mt-1"
                placeholder="Brief description of your analysis project"
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Select OTAs -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Select OTA Platforms</h2>
          <p class="text-gray-600 mb-6">Choose which platforms you want to analyze:</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="ota in availableOTAs"
              :key="ota.id"
              class="relative"
            >
              <input
                :id="ota.id"
                v-model="form.selectedOTAs"
                :value="ota.id"
                type="checkbox"
                class="sr-only"
              />
              <label
                :for="ota.id"
                class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors"
                :class="form.selectedOTAs.includes(ota.id) 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'"
              >
                <div class="flex-shrink-0 w-8 h-8">
                  <img :src="ota.logo" :alt="ota.name" class="w-full h-full object-contain" />
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ ota.name }}</p>
                  <p class="text-xs text-gray-500">{{ ota.description }}</p>
                </div>
                <div
                  v-if="form.selectedOTAs.includes(ota.id)"
                  class="ml-auto flex-shrink-0 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Add URLs -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Add Listing URLs</h2>
          <p class="text-gray-600 mb-6">
            Paste the URLs of the listings you want to analyze. You can add multiple URLs, one per line.
          </p>
          
          <div class="space-y-4">
            <div>
              <label for="urls" class="block text-sm font-medium text-gray-700">
                Listing URLs
              </label>
              <textarea
                id="urls"
                v-model="form.urls"
                rows="8"
                class="input-field mt-1"
                placeholder="https://www.airbnb.com/rooms/123456&#10;https://www.booking.com/hotel/example&#10;https://www.vrbo.com/property/123456"
              ></textarea>
              <p class="mt-2 text-sm text-gray-500">
                {{ urlCount }} URL{{ urlCount !== 1 ? 's' : '' }} detected
              </p>
            </div>
            
            <div v-if="urlCount > 0" class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Detected URLs:</h4>
              <div class="space-y-1">
                <div
                  v-for="(url, index) in parsedUrls"
                  :key="index"
                  class="text-sm text-gray-600 flex items-center"
                >
                  <span class="w-6 text-gray-400">{{ index + 1 }}.</span>
                  <span class="truncate">{{ url }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Analysis Options -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Analysis Options</h2>
          <p class="text-gray-600 mb-6">
            Choose what you want to analyze for each listing:
          </p>
          
          <div class="space-y-4">
            <div
              v-for="option in analysisOptions"
              :key="option.id"
              class="flex items-start"
            >
              <input
                :id="option.id"
                v-model="form.analysisOptions"
                :value="option.id"
                type="checkbox"
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label :for="option.id" class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ option.title }}</p>
                <p class="text-sm text-gray-500">{{ option.description }}</p>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Review & Create -->
      <div v-if="currentStep === 5" class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Review & Create</h2>
          
          <div class="space-y-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Project Summary</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Project Name:</span>
                  <span class="font-medium">{{ form.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Selected OTAs:</span>
                  <span class="font-medium">{{ selectedOTANames.join(', ') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">URLs to Analyze:</span>
                  <span class="font-medium">{{ urlCount }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Analysis Options:</span>
                  <span class="font-medium">{{ selectedAnalysisOptions.length }}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-blue-800">What happens next?</h3>
                  <div class="mt-2 text-sm text-blue-700">
                    <p>1. Your project will be created and queued for analysis</p>
                    <p>2. Our AI will process each listing and extract insights</p>
                    <p>3. You'll receive a comprehensive report with findings</p>
                    <p>4. Analysis typically takes 5-15 minutes depending on the number of listings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between pt-6 border-t border-gray-200">
        <button
          v-if="currentStep > 1"
          @click="previousStep"
          type="button"
          class="btn-secondary"
        >
          Previous
        </button>
        <div v-else></div>
        
        <button
          v-if="currentStep < steps.length"
          @click="nextStep"
          type="button"
          :disabled="!canProceed"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ currentStep === steps.length - 1 ? 'Create Project' : 'Next' }}
        </button>
        
        <button
          v-else
          @click="createProject"
          type="button"
          :disabled="projectsStore.loading"
          class="btn-primary"
        >
          <svg
            v-if="projectsStore.loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ projectsStore.loading ? 'Creating...' : 'Create Project' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const toast = useToast()

const currentStep = ref(1)

const steps = [
  { title: 'Project Details' },
  { title: 'Select OTAs' },
  { title: 'Add URLs' },
  { title: 'Analysis Options' },
  { title: 'Review & Create' }
]

const availableOTAs = [
  {
    id: 'airbnb',
    name: 'Airbnb',
    description: 'Vacation rentals and experiences',
    logo: '/images/airbnb-logo.png'
  },
  {
    id: 'booking',
    name: 'Booking.com',
    description: 'Hotels, flights, and car rentals',
    logo: '/images/booking-logo.png'
  },
  {
    id: 'vrbo',
    name: 'VRBO',
    description: 'Vacation rentals by owner',
    logo: '/images/vrbo-logo.png'
  },
  {
    id: 'expedia',
    name: 'Expedia',
    description: 'Travel deals and packages',
    logo: '/images/expedia-logo.png'
  },
  {
    id: 'hotels',
    name: 'Hotels.com',
    description: 'Hotel bookings and rewards',
    logo: '/images/hotels-logo.png'
  },
  {
    id: 'tripadvisor',
    name: 'TripAdvisor',
    description: 'Reviews and travel planning',
    logo: '/images/tripadvisor-logo.png'
  }
]

const analysisOptions = [
  {
    id: 'reviews',
    title: 'Reviews & Ratings',
    description: 'Analyze guest reviews, ratings, and sentiment'
  },
  {
    id: 'images',
    title: 'Images & Visual Content',
    description: 'Evaluate photo quality, composition, and appeal'
  },
  {
    id: 'amenities',
    title: 'Amenities & Features',
    description: 'Extract and categorize property amenities'
  },
  {
    id: 'pricing',
    title: 'Pricing Analysis',
    description: 'Compare pricing with similar properties'
  },
  {
    id: 'location',
    title: 'Location Insights',
    description: 'Analyze neighborhood and accessibility factors'
  },
  {
    id: 'competition',
    title: 'Competitive Analysis',
    description: 'Compare with similar listings in the area'
  }
]

const form = ref({
  name: '',
  description: '',
  selectedOTAs: [],
  urls: '',
  analysisOptions: ['reviews', 'images', 'amenities']
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.name.trim().length > 0
    case 2:
      return form.value.selectedOTAs.length > 0
    case 3:
      return urlCount.value > 0
    case 4:
      return form.value.analysisOptions.length > 0
    default:
      return true
  }
})

const urlCount = computed(() => {
  return parsedUrls.value.length
})

const parsedUrls = computed(() => {
  if (!form.value.urls) return []
  return form.value.urls
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && isValidUrl(url))
})

const selectedOTANames = computed(() => {
  return availableOTAs
    .filter(ota => form.value.selectedOTAs.includes(ota.id))
    .map(ota => ota.name)
})

const selectedAnalysisOptions = computed(() => {
  return analysisOptions
    .filter(option => form.value.analysisOptions.includes(option.id))
    .map(option => option.title)
})

const getStepClass = (index) => {
  if (currentStep.value > index + 1) {
    return 'bg-primary-600 text-white'
  } else if (currentStep.value === index + 1) {
    return 'bg-primary-100 text-primary-600 border-2 border-primary-600'
  } else {
    return 'bg-gray-100 text-gray-400'
  }
}

const getStepTextClass = (index) => {
  if (currentStep.value >= index + 1) {
    return 'text-gray-900'
  } else {
    return 'text-gray-400'
  }
}

const isValidUrl = (string) => {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

const nextStep = () => {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const createProject = async () => {
  try {
    const projectData = {
      name: form.value.name,
      description: form.value.description,
      userId: authStore.user.id,
      otaUrls: parsedUrls.value,
      analysisOptions: form.value.analysisOptions,
      selectedOTAs: form.value.selectedOTAs
    }
    
    const project = await projectsStore.createProject(projectData)
    
    // Trigger analysis
    await projectsStore.triggerAnalysis(project.id)
    
    toast.success('Project created successfully! Analysis has started.')
    router.push(`/projects/${project.id}`)
  } catch (error) {
    toast.error('Failed to create project')
  }
}

onMounted(() => {
  // Initialize auth if not already done
  if (authStore.loading) {
    authStore.initializeAuth()
  }
})
</script> 