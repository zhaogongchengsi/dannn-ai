import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function readJsonFile<T>(directory: string, fileName: string): T | null {
  const filePath = join(directory, fileName)
  try {
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent) as T
  }
  catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error)
    return null
  }
}

export interface PackageJson {
  name: string
  version: string
  description: string
  type: 'module' | 'commonjs'
  main: string
  module: string
  types: string
}

export function readPackageJson(directory: string) {
  return readJsonFile<PackageJson>(directory, 'package.json')
}
