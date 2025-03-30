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
import { useExtension } from '@/composables/extension'
import { MoreHorizontal, Plus } from 'lucide-vue-next'

const extension = useExtension()
const isMac = window.dannn.is.mac
</script>

<template>
  <Sidebar :collapsible="isMac ? 'none' : 'icon'">
    <SidebarHeader class="items-end">
      <SidebarTrigger />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>AI</SidebarGroupLabel>
        <SidebarGroupAction>
          <Plus />
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible v-for="item in extension.extensions" :key="item.id" class="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton :tooltip="item.config.description">
                    <img :src="item.config.icon" alt="icon" class="size-5 object-contain">
                    <span>{{ item.config.name }}</span>
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
                    <SidebarMenuItem v-for="ai in item.config.aiCollection" :key="ai.name">
                      <SidebarMenuButton as-child :title="ai.description">
                        <RouterLink :to="`/chat/${encodeURI(ai.name)}?extension=${item.config.name}`" active-class="bg-[hsl(var(--background-secondary))]">
                          <span>{{ ai.name }}</span>
                        </RouterLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
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
