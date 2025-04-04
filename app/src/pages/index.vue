<script setup lang='ts'>
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
import { useChatStore } from '@/stores/chat'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

const chatStore = useChatStore()

const chatSchemas = z.object({
  title: z.string().min(1, '名称不能为空').describe('聊天名称'),
  description: z.string().optional().describe('描述'),
  systemPrompt: z.string().optional().describe('提示词'),
})

const form = useForm({
  validationSchema: toTypedSchema(chatSchemas),
})

function onFormSubmit(values) {
  console.log('Form submitted:', values)
}
</script>

<template>
  <div class="w-full h-full flex justify-center">
    <div class="w-full max-w-3xl p-4">
      <div class="w-full mb-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">
            聊天列表
            <p class="text-sm text-muted-foreground">
              这里是你所有的聊天记录。
            </p>
          </h2>
          <Dialog>
            <DialogTrigger>
              <Button>
                创建新聊天
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
                :form="form"
                :schema="chatSchemas" :field-config="{
                  title: {
                    label: '聊天名称',
                    placeholder: '请输入聊天名称',
                    description: '群聊的名称',
                  },
                  description: {
                    label: '描述',
                  },
                  systemPrompt: {
                    label: '提示词',
                  },
                }"
                @submit="onFormSubmit"
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
        </div>
      </div>
      <Table class="w-full">
        <TableHeader>
          <TableRow>
            <TableHead class="w-[100px]">
              名称
            </TableHead>
            <TableHead>描述</TableHead>
            <TableHead>提示词</TableHead>
            <TableHead class="text-right">
              参与者
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="text-sm text-muted-foreground max-h-24 overflow-auto">
          <TableRow v-for="chat of chatStore.chats" :key="chat.id">
            <TableCell class="font-medium">
              {{ chat.title }}
            </TableCell>
            <TableCell>{{ chat.description }}</TableCell>
            <TableCell>{{ chat.systemPrompt }}</TableCell>
            <TableCell class="text-right">
              ${{ chat.participants }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
