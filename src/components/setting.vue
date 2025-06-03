<script setup lang='ts'>
import { Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const config = useConfig()

const mode = computed({
  get: () => config.mode.value,
  set: (value) => {
    config.mode.value = value
    config.set('theme', value)
  },
})

function onToggleDevtools() {
  window.dannn.ipc.invoke('window.toggle-devtools')
}

function onKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey && event.key === 'd') {
    onToggleDevtools()
  }
}

useEventListener('keydown', onKeyDown)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="size-7">
        <Settings :size="24" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <span>Profile</span>
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Billing</span>
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem as-child>
          <router-link to="/settings">
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </router-link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Keyboard shortcuts</span>
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <span>Plugins</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup v-model="mode">
                <DropdownMenuRadioItem value="light">
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <span>Dark</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <span>System</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem as-child>
        <a href="https://github.com/zhaogongchengsi/dannn-ai">GitHub</a>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <a href="https://github.com/zhaogongchengsi/dannn-ai/issues">Help</a>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <RouterLink to="/">
          Login out
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="onToggleDevtools">
        <span>Open Devtools</span>
        <DropdownMenuShortcut>
          <span class="text-xs">Ctrl D</span>
        </DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
