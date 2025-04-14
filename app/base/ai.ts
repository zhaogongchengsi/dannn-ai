import type { AIData, InfoMessage } from 'common/types'
import { omit } from 'lodash'
import { Subject } from 'rxjs'
import { onQuestionWithAiId } from './api/message'

export class AI {
  private readonly _config: AIData
  private readonly subject = new Subject<InfoMessage>()

  constructor(config: AIData) {
    this._config = config
    this.bindEvents()
  }

  private bindEvents() {
    onQuestionWithAiId(this.id, (message) => {
      this.subject.next(omit(message, ['roomParticipants']))
    })
  }

  onQuestion(callback: (message: InfoMessage) => void) {
    const unsubscribe = this.subject.subscribe(callback)
    return () => unsubscribe.unsubscribe()
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
