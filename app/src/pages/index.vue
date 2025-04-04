<script setup lang='ts'>
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
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
              hello
              <DialogFooter>
                <Button variant="secondary" class="mr-2" type="button">
                  取消
                </Button>
                <Button type="submit">
                  创建
                </Button>
              </DialogFooter>
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
