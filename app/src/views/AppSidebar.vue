<script setup lang="ts">
import ModeToggle from '@/components/mode-toggle.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue'
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <SidebarGroup />
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter>
      <div
        class="flex items-center justify-between group-data-[collapsible=offcanvas]:flex-col group-data-[collapsible=icon]:flex-col"
      >
        <ModeToggle />
        <SidebarTrigger />
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
