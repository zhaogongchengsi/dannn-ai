<script setup lang='ts'>
import { useConfigState } from '@/composables/config'

const config = useConfigState()
console.log('Home')
</script>

<template>
  <div>
    Home {{ config.config.value }}
  </div>
</template>
