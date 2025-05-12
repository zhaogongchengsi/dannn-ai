<script setup lang='ts'>
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
import { useConfig } from '@/composables/config'
import ChatAdd from '@/views/chat-add.vue'
import { computed } from 'vue'

const config = useConfig()

const chatStore = useChatStore()
const router = useRoute<'/chat/[id]/'>()

watchEffect(() => {
  const id = router.params.id
  if (!id) {
    return
  }

  chatStore.setCurrentChatID(Number(id))
})

useMessagesStore()

const toasterTheme = computed(() => {
  const mode = config.mode.value
  if (mode === 'auto') {
    return 'system'
  }
  return mode === 'dark' ? 'dark' : 'light'
})
</script>

<template>
  <SidebarProvider class="sidebar">
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>聊天群</SidebarGroupLabel>
          <SidebarGroupAction>
            <ChatAdd />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="chat of chatStore.rooms" :key="chat.id">
                <SidebarMenuButton as-child>
                  <RouterLink
                    :to="`/chat/${chat.id}/`"
                  >
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
</template>
