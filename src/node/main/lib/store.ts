import type { Low } from 'lowdb'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { ipcMain } from 'electron'
import { JSONFilePreset } from 'lowdb/node'
import { dirname, join } from 'pathe'
import { APP_DATA_PATH } from '../constant'

export interface StoreOptions<T = any> {
  name: string
  defaultData: T
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
    this.defaultData = opt.defaultData
    this.path = join(APP_DATA_PATH, `${opt.name}.json`)
  }

  async init() {
    await ensureFile(this.path, JSON.stringify(this.defaultData))
    const db: Low<D> = await JSONFilePreset(
      this.path,
      this.defaultData,
    )
    this.db = db

    ipcMain.handle(`${this.name}.get`, () => {
      return this.getStore().data
    })

    ipcMain.handle(`${this.name}.set`, (_, key, value) => {
      this.set(key, value)
      return this.saveStore()
    })
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

async function ensureFile(path: string, data: string = '{}') {
  if (!existsSync(path)) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, data, { flag: 'wx', encoding: 'utf-8' })
  }
}
