<script setup lang='ts'>

</script>

<template>
  <div class="main-container-height flex flex-col justify-center items-center gap-4">
    <span class="text-xl font-bold">404</span>
    <p class="text-sm text-zinc-600">
      <span class="text-red-400">{{ $route.fullPath }}</span> Page Not Found
    </p>
    <span class="text-sm text-zinc-600">Please check the URL or return to the home page.</span>
    <router-link to="/" class="text-blue-500 hover:underline cursor-pointer">
      Go to Home
    </router-link>
  </div>
</template>
