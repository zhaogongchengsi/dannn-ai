<script setup lang='ts'>
import Button from '@/components/ui/button/Button.vue'
import Sparkles from '@/components/ui/sparkles/Sparkles.vue'

const config = useConfig()

const particlesColor = computed(() => (config.mode.value === 'dark' ? '#FFFFFF' : '#000000'))
</script>

<template>
  <div
    class="h-full w-full flex flex-col"
  >
    <div class="flex flex-col w-full items-center justify-center flex-1">
      <h1 class="relative z-20 text-center text-3xl font-bold text-black lg:text-9xl md:text-7xl dark:text-white">
        Dannn AI
      </h1>
      <div class="relative h-60 w-[80rem]">
        <div
          class="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
        />
        <div class="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        <div
          class="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm"
        />
        <div class="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

        <Sparkles
          background="transparent" :min-size="0.4" :max-size="1.4" :particle-density="1200" class="size-full"
          :particle-color="particlesColor"
        />

        <div
          class="absolute inset-0 size-full [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"
        />
      </div>
      <div class="relative mt-10 flex flex-col items-center">
        <Button>
          <RouterLink to="/chat" class="text-white">
            进入聊天
          </RouterLink>
        </Button>
      </div>
    </div>
  </div>
</template>
