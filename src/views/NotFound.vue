<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full text-center">
      <div class="mx-auto h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
        </svg>
      </div>
      
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-900 mb-4">Page not found</h2>
      <p class="text-gray-600 mb-8">
        Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
      </p>
      
      <div class="space-y-4">
        <router-link to="/dashboard" class="btn-primary block">
          Go to Dashboard
        </router-link>
        <router-link to="/projects" class="btn-secondary block">
          View Projects
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed for this simple 404 page
</script> 