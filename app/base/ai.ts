import type { AIData } from 'common/types'

export class AI {
  private readonly _config: AIData
  constructor(config: AIData) {
    this._config = config
  }

  bindEvents() {

  }

  get config() {
    return this._config
  }

  get id() {
    return this._config.id
  }

  get name() {
    return this._config.name
  }
}
