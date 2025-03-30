<script setup lang="ts">
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
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue'
import { useSidebarStore } from '@/stores/sidebar'
import { MoreHorizontal, Plus } from 'lucide-vue-next'

const sidebar = useSidebarStore()
const isMac = window.dannn.is.mac
</script>

<template>
  <Sidebar :collapsible="isMac ? 'none' : 'icon'">
    <SidebarHeader class="items-end" :class="{ dragging: isMac }">
      <SidebarTrigger v-if="!isMac" />
      <div v-else class="h-4" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Dannn AI</SidebarGroupLabel>
        <SidebarGroupAction>
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <template v-for="item in sidebar.sidebar" :key="item.id">
              <Collapsible v-if="item.children && item.children.length" class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.tooltip ?? item.title">
                      <img v-if="item.icon" :src="item.icon" alt="icon" class="size-5 object-contain">
                      <span>{{ item.title }}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>
                          <RouterLink :to="`readme?id=${item.id}`">
                            <span>文档</span>
                          </RouterLink>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuItem v-for="ci in item.children" :key="ci.id">
                        <SidebarMenuButton as-child :title="ci.tooltip ?? ci.title">
                          <RouterLink v-if="ci.link" :to="ci.link" active-class="bg-sidebar-accent text-sidebar-accent-foreground">
                            <span>{{ ci.title }}</span>
                          </RouterLink>
                          <div v-else>
                            <span>{{ ci.title }}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <SidebarMenuItem v-else>
                <SidebarMenuButton v-if="item.link" as-child :tooltip="item.tooltip ?? item.title">
                  <RouterLink v-if="item.link" :to="item.link" active-class="bg-sidebar-accent text-sidebar-accent-foreground">
                    <img v-if="item.icon" :src="item.icon" alt="icon" class="size-5 object-contain">
                    <span>{{ item.title }}</span>
                  </RouterLink>
                </SidebarMenuButton>
                <SidebarMenuButton v-else>
                  <img v-if="item.icon" :src="item.icon" alt="icon" class="size-5 object-contain">
                  <span>{{ item.title }}</span>
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
