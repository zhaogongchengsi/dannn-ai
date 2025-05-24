<script setup lang='ts'>
import { computed, ref } from 'vue'
import defaultAvatar from '@/assets/default-avatar.png'
import Avatar from '@/components/avatar/avatar.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAIStore } from '@/stores/ai'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const aiStore = useAIStore()
const selectAiValue = ref([])

const aiParticipants = computed(() => {
  if (!chatStore.currentChat) {
    return []
  }
  return chatStore.currentChat.participant
})

const notParticipate = computed(() => {
  return aiStore.ais.filter((ai) => {
    return !aiParticipants.value.some(participant => participant.id === ai.id)
  })
})

function onAddAiButtonClick() {
  if (!chatStore.currentChat) {
    return
  }
  selectAiValue.value.forEach((aiId) => {
    chatStore.addAiToChat(chatStore.currentChat!.id, aiId)
  })
}
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <button v-if="chatStore.currentChat" class="px-4 h-full flex items-center gap-3 no-dragging-button">
        <h2 class="font-bold cursor-pointer select-none">
          {{ chatStore.currentChat.title }}
        </h2>
        <span>{{ chatStore.currentChat.participant.length }}</span>
      </button>
    </SheetTrigger>
    <SheetContent class="w-1/3 min-w-[350px]">
      <SheetHeader>
        <SheetTitle>{{ chatStore.currentChat?.title }}</SheetTitle>
        <SheetDescription>
          {{ chatStore.currentChat?.description }}
        </SheetDescription>
      </SheetHeader>
      <div class="flex flex-col gap-4 mt-4">
        <div>
          <h3 class="font-bold">
            AI 成员 {{ aiParticipants.length }}
          </h3>
          <div v-if="aiParticipants.length === 0" class="flex items-center justify-center h-24 text-gray-500">
            <span class="text-sm">
              还没有 AI 成员
            </span>
          </div>
          <ul v-else class="flex flex-col gap-2 my-4">
            <li v-for="ai of aiParticipants" :key="ai.name" class="flex items-center gap-4 border p-2 rounded-md">
              <Avatar class="size-10" :src="ai.avatar ?? defaultAvatar" />
              <div class="flex-1">
                <div class="w-full flex items-center justify-between gap-2">
                  <span class="font-bold">{{ ai.name }}</span>
                  <span class="text-sm text-zinc-500">{{ ai.type }}</span>
                </div>
                <p class="text-sm text-zinc-500">
                  {{ ai.description }}
                </p>
              </div>
            </li>
          </ul>
          <Dialog>
            <DialogTrigger>
              <Button size="sm">
                <span class="text-sm">添加 AI</span>
              </Button>
            </DialogTrigger>
            <DialogContent :overlay="false">
              <DialogHeader>
                <DialogTitle>添加AI成员</DialogTitle>
                <DialogDescription>
                  选择要添加的AI成员
                </DialogDescription>
              </DialogHeader>

              <ToggleGroup v-if="notParticipate.length !== 0" v-model="selectAiValue" type="multiple" variant="outline">
                <ToggleGroupItem v-for="ai of notParticipate" :key="ai.id" :value="ai.id" class="flex items-center gap-2 p-2 rounded-md">
                  <Avatar class="size-6" :src="ai.avatar ?? defaultAvatar" />
                  <span class="text-sm">{{ ai.name }}</span>
                </ToggleGroupItem>
              </ToggleGroup>
              <div v-else class="flex items-center justify-center h-24 text-gray-500">
                <span class="text-sm">
                  还没有可以添加的 AI 成员
                </span>
              </div>

              <DialogFooter>
                <Button :disable="selectAiValue.length === 0" size="sm" class="w-full" @click="onAddAiButtonClick">
                  添加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
