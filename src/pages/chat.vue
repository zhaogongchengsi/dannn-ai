<script setup lang='ts'>
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import ChatAdd from '@/views/chat-add.vue'
import ChatAvatar from '@/views/chat-avatar.vue'
import ChatHeader from '@/views/chat-header.vue'

const chatStore = useChatStore()
const route = useRoute<'/chat/[id]/'>()
const isOpen = useStorage('sidebar-open', true, localStorage)

watchEffect(() => {
  const id = route.params.id
  if (!id) {
    chatStore.setCurrentChatID(0)
    return
  }

  chatStore.setCurrentChatID(Number(id))
})

useMessagesStore()
</script>

<template>
  <SidebarProvider v-model:open="isOpen" style="height: calc(100vh - var(--app-header-height))">
    <Sidebar collapsible="icon" style="height: calc(100vh - var(--app-header-height))">
      <SidebarHeader>
        <div class="w-full flex items-center justify-between gap-2 group-data-[state=collapsed]:flex-col">
          <div class="flex items-center justify-center gap-2">
            <img src="/icon_128x128.png" alt="logo" class="size-8 block">
            <h1 class="group-data-[state=collapsed]:hidden">
              Dannn AI
            </h1>
          </div>
          <SidebarTrigger />
        </div>
        <ChatAdd />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu class="py-4 px-2">
          <SidebarMenuItem v-for="chat in chatStore.rooms" :key="chat.id">
            <SidebarMenuButton size="auto" class="group-data-[state=collapsed]:p-0!" as-child>
              <RouterLink
                :to="`/chat/${chat.id}/`" class="flex items-center gap-2 size-full"
                active-class="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <ChatAvatar class="shrink-1" :chat="chat" />
                <div class="group-data-[state=collapsed]:hidden flex-1 min-w-0">
                  <span class="text-lg font-600 truncate block min-w-0">{{ chat.title }}</span>
                  <div v-if="chat.lastEntityMessage">
                    <p class="line-clamp-2 min-w-0 text-zinc-500 dark:text-zinc-400 text-sm">
                      {{ chat.lastEntityMessage.content.substring(0, 30) }}
                    </p>
                  </div>
                </div>
              </RouterLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
    <section class="relative ml-auto flex-1 min-w-0" :style="{ width: isOpen ? 'calc(100vw - var(--sidebar-width))' : 'calc(100vw - var(--sidebar-width-icon))' }">
      <ChatHeader />
      <ScrollArea
        class="w-full overflow-auto"
        :style="{ height: 'calc(100vh - var(--app-chat-header-height) - var(--app-header-height))' }"
      >
        <router-view />
      </ScrollArea>
    </section>
  </SidebarProvider>
</template>
