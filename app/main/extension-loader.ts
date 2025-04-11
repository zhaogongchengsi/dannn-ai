import { EXTENSIONS_ROOT } from "./constant";
import { readdir } from 'node:fs/promises'
import { ExtensionProcess } from "./lib/extension";
import { join } from "pathe";

export async function extensionLoadAll() {
	const processes = []

	try {
		const dirs = await readdir(EXTENSIONS_ROOT)

		for (const dir of dirs) {
			const eProcess = new ExtensionProcess(join(EXTENSIONS_ROOT, dir), {
				env: {
					PORT: String(process.env.PORT),
				},
			})
			try {
				await eProcess.start()
				processes.push(eProcess)
			} catch (err) {
				console.error(`Failed to load extension ${dir}`, err)
			}
		}
	} catch (err: any) {
		console.error(`Failed to load extensions`, err)
	}

	return processes
}