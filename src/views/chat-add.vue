<script setup lang='ts'>
import { Plus } from 'lucide-vue-next'
import { z } from 'zod'
import { AutoForm } from '@/components/ui/auto-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const chatStore = useChatStore()
const isOpen = ref(false)

const createChatSchemas = z.object({
  title: z.string().min(1, '请输入聊天名称').max(20, '聊天名称过长'),
  description: z.string().optional(),
  systemPrompt: z.string().optional(),
})

async function onFormSubmit(values: Record<string, any>) {
  await chatStore.addRoom({
    title: values.title,
    avatar: null,
    description: values.description,
    prompt: values.systemPrompt,
  })
    .finally(() => {
      isOpen.value = false
    })
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger class="w-full">
      <Button class="w-full">
        <Plus class="size-5" />
        <span class="group-data-[state=collapsed]:hidden">添加聊天</span>
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>创建新聊天</DialogTitle>
        <DialogDescription>
          选择你需要的 AI 加入群聊
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        :schema="createChatSchemas" :field-config="{
          title: {
            label: '房间名称',
            description: '房间的名称',
          },
          description: {
            label: '描述',
          },
          systemPrompt: {
            label: '提示词',
          },
        }" @submit="onFormSubmit"
      >
        <DialogFooter class="mt-5">
          <DialogClose>
            <Button variant="secondary" class="mr-2" type="button">
              取消
            </Button>
          </DialogClose>
          <Button type="submit">
            创建
          </Button>
        </DialogFooter>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
