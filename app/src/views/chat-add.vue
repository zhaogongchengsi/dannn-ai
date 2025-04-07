<script setup lang='ts'>
import type { CreateChatSchemas } from '@/lib/database/chatService'
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
import { createChatSchemas } from '@/lib/database/chatService'
import { useChatStore } from '@/stores/chat'
import { toTypedSchema } from '@vee-validate/zod'
import { Plus } from 'lucide-vue-next'
import { useForm } from 'vee-validate'

const chatStore = useChatStore()

const form = useForm({
  validationSchema: toTypedSchema(createChatSchemas),
})

function onFormSubmit(values: CreateChatSchemas) {
  chatStore.addChat(values)
}
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Plus class="size-5" />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>创建新聊天</DialogTitle>
        <DialogDescription>
          选择你需要的 AI 加入群聊
        </DialogDescription>
      </DialogHeader>
      <AutoForm
        :form="form" :schema="createChatSchemas" :field-config="{
          title: {
            label: '聊天名称',
            description: '群聊的名称',
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
