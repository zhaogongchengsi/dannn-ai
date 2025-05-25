import { callProcedure } from "@trpc/server/unstable-core-do-not-import";
import { ipcMain, app } from "electron";
import { Bridge, BridgeRequest } from "~/common/bridge";
import { createContext } from "~/node/server/context";
import { appRouter } from "~/node/server/router";

export class MainIpc extends Bridge {
	webContents: Electron.WebContents[] = []
	constructor() {
		super()
		this.register('trpc:response', this.trpcResponse.bind(this))
		ipcMain.on('trpc:message', (_, args) => {
			if (args) {
				this.onMessage(args)
			}
		})

		app.on('web-contents-created', (_, webContents: Electron.WebContents) => {
			this.webContents.push(webContents)
			webContents.once('destroyed', () => {
				this.webContents = this.webContents.filter(wc => wc !== webContents)
			})
		})
	}

	send(data: BridgeRequest): void {
		this.webContents.forEach((webContents) => {
			if (webContents.isDestroyed()) {
				return
			}
			webContents.send('trpc:message', data)
		})
	}

	async trpcResponse(request: { id: string, type: "mutation" | "query" | "subscription", path: string, input: any }) {
		console.log('trpcResponse', request)

		const result = await callProcedure({
			// @ts-ignore
			procedures: appRouter._def.procedures,
			path: request.path,
			rawInput: request.input,
			ctx: createContext(), // 通常这里构建一个上下文（可带用户信息等）
			type: request.type,
		});

		console.log('trpcResponse result', result)

		return result
	}
}