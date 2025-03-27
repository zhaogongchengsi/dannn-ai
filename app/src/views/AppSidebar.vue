<script setup lang="ts">
import ModeToggle from '@/components/mode-toggle.vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar'
import { useExtension } from '@/composables/extension'
import { MoreHorizontal, Plus } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const extensions = useExtension()
</script>

<template>
  <Dialog>
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AI</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible v-for="item in extensions.extensions.value" :key="item.name" class="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger as-child>
                    <SidebarMenuButton :tooltip="item.name">
                      <img :src="item.icon" alt="icon" class="size-5 object-contain">
                      <span>{{ item.name }}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <SidebarMenuAction>
                          <MoreHorizontal />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>
							<DialogTrigger><span>文档</span></DialogTrigger>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuItem v-for="ai in item.aiCollection" :key="ai.name">
                        <SidebarMenuButton as-child :title="ai.description">
                          <span>{{ ai.name }}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div
          class="flex items-center justify-between group-data-[collapsible=offcanvas]:flex-col group-data-[collapsible=icon]:flex-col"
        >
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Are you absolutely sure?</DialogTitle>
				<DialogDescription>This action cannot be undone.</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button>Submit</Button>
				<DialogClose>
					<Button variant="outline">
						Cancel
					</Button>
				</DialogClose>
			</DialogFooter>
		</DialogContent>
  </Dialog>
</template>
