import { app } from 'electron'
import { Low } from 'lowdb'
import { JSONFilePreset } from 'lowdb/node'
import { join } from 'pathe'
import { Ipc } from './ipc'

export interface StoreData {
	window: {
		width: number
		height: number
	}
	theme: 'light' | 'dark' | 'system'
}

const defaultData: StoreData = {
	window: {
		width: 900,
		height: 670,
	},
	theme: 'system',
}

export class Store {
	db: Low<StoreData> | null = null
	constructor() { }

	async init() {
		const db = await JSONFilePreset(
			join(app.getPath('userData'), 'dannn-ai.json'),
			defaultData,
		)
		this.db = db
	}

	getStore() {
		if (this.db) {
			return this.db
		}
		throw new Error('Store not initialized')
	}

	get<K extends keyof StoreData>(key: K): StoreData[K] {
		return this.getStore().data[key]
	}

	saveStore() {
		return this.getStore().write()
	}
	
	set<K extends keyof StoreData>(key: K, value: StoreData[K]) {
		this.getStore().data[key] = value
		return this.saveStore()
	}

	register(ipc: Ipc) {
		ipc.register('store.get', (name: keyof StoreData) => {
			return this.get(name)
		})
		ipc.register('store.set', (key: keyof StoreData, value: StoreData[keyof StoreData]) => {
			this.set(key, value)
		})
	}
}
