import { join } from "pathe"
import { EXTENSIONS_ROOT } from "../constant"
import { ExtensionProcess } from "./extension"
import { readdir } from "node:fs/promises"
import { logger } from "../lib/logger"

export class ExtensionHub {
	static readonly hub: Map<string, ExtensionProcess> = new Map()

	constructor() { }

	async loader() {
		readdir(EXTENSIONS_ROOT)
			.then((dirs) => {
				for (const dir of dirs) {
					const subprocess = new ExtensionProcess(join(EXTENSIONS_ROOT, dir))
					ExtensionHub.hub.set(subprocess.getId(), subprocess)
				}
			})
			.catch((err) => {
				logger.error("Error loading extensions:", err)
			})
	}
}