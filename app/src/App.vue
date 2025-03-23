<script setup lang='ts'>
import Button from './components/ui/button/Button.vue'
import { useConfigState } from './composables/config';
import Home from './views/home.vue';
useConfigState()
</script>

<template>
  <div>
    <Button>button</Button>
    <Home />
  </div>
</template>
