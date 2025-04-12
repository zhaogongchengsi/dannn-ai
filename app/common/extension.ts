export interface Extension {
	activate: () => void | Promise<void>
	deactivate: () => void | Promise<void>
}