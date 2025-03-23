import { Store } from "./store"

export interface ConfigData {
	window: {
		width: number
		height: number
	}
	theme: 'light' | 'dark' | 'system'
}

export class Config extends Store<ConfigData> {
	constructor() {
		super({
			name: 'config',
			defaultDate: {
				window: {
					width: 900,
					height: 670,
				},
				theme: 'system',
			},
		})
	}
}