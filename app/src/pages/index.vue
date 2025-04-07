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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createChatSchemas } from '@/lib/database/chatService'
import { useChatStore } from '@/stores/chat'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const chatStore = useChatStore()
const router = useRouter()

const form = useForm({
  validationSchema: toTypedSchema(createChatSchemas),
})

function onFormSubmit(values: CreateChatSchemas) {
  chatStore.addChat(values)
}

onMounted(() => {
  chatStore.setCurrentChatID(null)
})

function onRowClick(chatId: string) {
  router.push({
    path: 'chat',
    query: {
      chatId,
    },
  })
}
</script>

<template>
  <div class="w-full h-full flex justify-center">
    <span>
      请选择聊天
    </span>
  </div>
</template>
