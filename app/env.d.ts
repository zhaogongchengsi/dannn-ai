interface DannnIpc {
	send: (channel: string, ...data: any[]) => void;
	on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
	removeListener: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
}

interface Dannn {
	ipc: DannnIpc;
}

interface Window {
	dannn: Dannn;
}