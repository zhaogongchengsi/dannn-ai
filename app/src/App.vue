<script setup lang='ts'>
import { PATTERN_BACKGROUND_DIRECTION, PATTERN_BACKGROUND_SPEED, PATTERN_BACKGROUND_VARIANT } from '@/components/ui/pattern-background'
import PatternBackground from '@/components/ui/pattern-background/PatternBackground.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import WindowMenus from '@/components/window-menus.vue'
import { computed } from 'vue'
import { useConfig } from './composables/config'
import { useChatStore } from './stores/chat'
import ChatAdd from './views/chat-add.vue'

const config = useConfig()
const chatStore = useChatStore()

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <PatternBackground
    :direction="PATTERN_BACKGROUND_DIRECTION.TopRight"
    :variant="PATTERN_BACKGROUND_VARIANT.Dot" class="w-screen h-screen"
    :speed="PATTERN_BACKGROUND_SPEED.Slow"
  >
    <div class="w-screen h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>聊天群</SidebarGroupLabel>
              <SidebarGroupAction>
                <ChatAdd />
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem v-for="chat of chatStore.rooms.values()" :key="chat.id">
                    <SidebarMenuButton as-child>
                      <RouterLink :to="`/chat?chatId=${chat.id}`">
                        {{ chat.title }}
                      </RouterLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <section class="w-full h-screen relative">
          <WindowMenus />
          <ScrollArea class="w-full overflow-auto" :style="{ height: 'calc(100vh - var(--app-header-height))' }">
            <router-view />
          </ScrollArea>
        </section>
      </SidebarProvider>
      <Toaster :theme="toasterTheme" />
    </div>
  </PatternBackground>
</template>
