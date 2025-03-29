import type { Extension } from '../schemas/extension'
import type { CreateExtensionOptions } from '../types/extension'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DnExtension } from './index'

vi.mock('@/utils/template', () => ({
  compileWithTemplate: vi.fn((config, context) => ({ ...config, ...context })),
}))

vi.mock('pathe', () => ({
  join: vi.fn((...args) => args.join('/')),
}))

vi.mock('lodash', () => ({
  compact: vi.fn(arr => arr.filter(Boolean)),
}))

vi.stubGlobal('window', {
  dannn: {
    getEnv: vi.fn(() => Promise.resolve({})),
    exists: vi.fn(() => Promise.resolve(false)),
    readFile: vi.fn(() => Promise.resolve('')),
  },
})

describe('dnExtension', () => {
  let config: Extension
  let options: CreateExtensionOptions
  let dnExtension: DnExtension

  beforeEach(() => {
    config = {
      name: 'Test Extension',
      permission: { env: ['TEST_ENV'] },
    } as Extension

    options = {
      pluginDir: '/path/to/plugin',
      lazyLoad: true,
      dirname: 'test-extension',
    }

    dnExtension = new DnExtension(config, options)
  })

  it('should initialize with correct values', () => {
    expect(dnExtension.config).toEqual(config)
    expect(dnExtension.dir).toBe(options.pluginDir)
    expect(dnExtension.options).toEqual(options)
    expect(dnExtension.disabled).toBe(false)
    expect(dnExtension.readme).toBe('')
    expect(dnExtension.id).toBe('test-extension')
  })

  it('should generate a valid ID', () => {
    const id = (dnExtension as any).generateId('Test Extension!!')
    expect(id).toBe('test-extension')
  })

  it('should load configuration and readme successfully', async () => {
    vi.spyOn(dnExtension, 'emit')

    vi.mocked(window.dannn.getEnv).mockResolvedValue({ TEST_ENV: 'value' })
    vi.mocked(window.dannn.exists).mockResolvedValueOnce(true)
    vi.mocked(window.dannn.readFile).mockResolvedValueOnce('README content')

    await dnExtension.load()

    expect(dnExtension.config).toEqual({
      ...config,
      process: { env: { TEST_ENV: 'value' } },
      self: config,
    })
    expect(dnExtension.readme).toBe('README content')
    expect(dnExtension.emit).toHaveBeenCalledWith('status-changed', 'loading')
    expect(dnExtension.emit).toHaveBeenCalledWith('loaded', dnExtension.config)
    expect(dnExtension.emit).toHaveBeenCalledWith('status-changed', 'active')
  })
})
