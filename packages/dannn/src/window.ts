import { SelfWorker } from './worker'; 

export class Window {
	selfWorker: SelfWorker
	constructor(
		selfWorker: SelfWorker
	) {
		this.selfWorker = selfWorker
	}

	getEnv(key: string) {
		return this.selfWorker.invoke('getEnv', key)
	}
}
