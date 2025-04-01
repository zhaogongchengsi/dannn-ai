<script setup lang="ts">
import type { Sidebar as SidebarType } from '@dannn/types'
import { useAppRx } from '@/base/rxjs/hook'
import ModeToggle from '@/components/mode-toggle.vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar'
import { useSidebarStore } from '@/stores/sidebar'
import { cloneDeep } from 'lodash'
import { MoreHorizontal, Plus } from 'lucide-vue-next'
import { onMounted, onUnmounted } from 'vue'

const isMac = window.dannn.is.mac

const rx = useAppRx()
const sidebarStore = useSidebarStore()

onMounted(() => {
  rx.sidebarReady()
})

onUnmounted(() => {
  rx.sidebarDestroy()
})

rx.onExtensionLoaded((extension) => {
  sidebarStore.addSidebar({
    id: extension.id,
    title: extension.name,
    icon: extension.icon,
    tooltip: extension.description,
    fromExtended: true,
    isRoot: true,
  })

  extension.implementation({
    getAllSidebars: async () => cloneDeep(sidebarStore.sidebar),
    createSidebar: async (sidebarItem: SidebarType) => {
      sidebarStore.addSidebar(sidebarItem)
      return sidebarItem
    },
    getSidebar: async (id: string) => {
      const sidebarItem = sidebarStore.getSidebar(id)
      if (!sidebarItem) {
        return undefined
      }
      return cloneDeep(sidebarItem)
    },
  })
})
</script>

<template>
  <Sidebar :collapsible="isMac ? 'none' : 'icon'">
    <SidebarHeader v-if="isMac" class="items-end" :class="{ dragging: isMac }">
      <div class="h-4" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Dannn AI</SidebarGroupLabel>
        <SidebarGroupAction>
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <template v-for="item in sidebarStore.sidebar" :key="item.id">
              <Collapsible v-if="item.children && item.children.length" class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.tooltip ?? item.title">
                      <img v-if="item.icon" :src="item.icon" alt="icon" class="size-5 object-contain">
                      <span>{{ item.title }}</span>
                    </SidebarMenuButton>
                    <!-- <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>
                          <RouterLink :to="`/readme?id=${item.id}`">
                            <span>文档</span>
                          </RouterLink>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu> -->
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuItem v-for="ci in item.children" :key="ci.id">
                        <SidebarMenuButton as-child :title="ci.tooltip ?? ci.title">
                          <RouterLink :to="`/${ci.type ?? 'chat'}/${ci.id}`" active-class="bg-sidebar-accent text-sidebar-accent-foreground">
                            <span>{{ ci.title }}</span>
                          </RouterLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem v-else>
                <SidebarMenuButton as-child :tooltip="item.tooltip ?? item.title">
                  <div v-if="item.isRoot">
                    <img v-if="item.icon" :src="item.icon" alt="icon" class="size-5 object-contain">
                    <span>{{ item.title }}</span>
                  </div>
                  <RouterLink v-else :to="`/chat/${item.id}`" active-class="bg-sidebar-accent text-sidebar-accent-foreground">
                    <img v-if="item.icon" :src="item.icon" alt="icon" class="size-5 object-contain">
                    <span>{{ item.title }}</span>
                  </RouterLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </template>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <div
        class="flex items-center justify-between group-data-[collapsible=offcanvas]:flex-col group-data-[collapsible=icon]:flex-col"
      >
        <ModeToggle />
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
