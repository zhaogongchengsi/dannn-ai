import { app } from 'electron'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { join } from 'pathe'

export interface StoreOptions<T = any> {
	name: string
	defaultDate: T
}

const nameSet = new Set<string>()

export class Store<D> {
	db: Low<D> | null = null
	path: string
	name: string
	defaultData: D
	constructor(opt: StoreOptions<D>) {
		this.name = opt.name
		if (nameSet.has(this.name)) {
			throw new Error(`Store name ${this.name} already exists`)
		}
		nameSet.add(this.name)
		this.defaultData = opt.defaultDate
		this.path = join(app.getPath('userData'), '.dannn' , `${opt.name}.json`)
	}

	async init() {
		const db = await JSONFilePreset(
			this.path,
			this.defaultData,
		)
		this.db = db
	}

	getStore() {
		if (this.db) {
			return this.db
		}
		throw new Error('Store not initialized')
	}

	get<K extends keyof D>(key: K): D[K] {
		return this.getStore().data[key]
	}

	saveStore() {
		return this.getStore().write()
	}
	
	set<K extends keyof D>(key: K, value: D[K]) {
		this.getStore().data[key] = value
		return this.saveStore()
	}

	getFilePath() {
		return this.path
	}
}
