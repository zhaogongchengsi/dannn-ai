import { Store } from "./store"

export interface Extension {
	name: string
	version: string
	icon?: string
	description?: string
	author?: string
	homepage?: string
	/**
	 * The main entry file
	 */
	mainEntry?: string
	/**
	 * The client entry file
	 */
	clientEntry?: string
}

export type Extensions = Extension[]

export class Loader extends Store<Extensions> {
	constructor() {
		super({
			name: 'extensions',
			defaultDate: [],
		})
	}
}