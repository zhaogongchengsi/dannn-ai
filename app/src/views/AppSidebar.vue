<script setup lang="ts">
import ModeToggle from '@/components/mode-toggle.vue'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenuSub,
	SidebarMenuAction,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarGroupLabel,
	SidebarGroupAction,
} from '@/components/ui/sidebar'
import SidebarTrigger from '@/components/ui/sidebar/SidebarTrigger.vue'
import { useExtension } from '@/composables/extension'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Plus } from 'lucide-vue-next'

const extensions = useExtension()

</script>

<template>
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
							<CollapsibleTrigger asChild>
								<SidebarMenuButton :tooltip="item.name">
									<img :src="item.icon" alt="icon" class="size-5 object-contain" />
									<span>{{ item.name }}</span>
								</SidebarMenuButton>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuAction>
											<MoreHorizontal />
										</SidebarMenuAction>
									</DropdownMenuTrigger>
									<DropdownMenuContent side="right" align="start">
										<DropdownMenuItem>
											<span>Edit Project</span>
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
										<SidebarMenuButton as-child>
											<span>{{ item.name }}</span>
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
			class="flex items-center justify-between group-data-[collapsible=offcanvas]:flex-col group-data-[collapsible=icon]:flex-col">
			<ModeToggle />
			<SidebarTrigger />
		</div>
	</SidebarFooter>
</Sidebar>
</template>
