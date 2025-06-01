import type { ClientOptions } from 'openai'
import type { InfoAI } from '~/node/database/service/ai'
import OpenAI from 'openai'

export class AI extends OpenAI {
  _meta: InfoAI
  _id: number
  constructor(meta: InfoAI, clientOpt: ClientOptions) {
    super(clientOpt)
    this._meta = meta
    this._id = meta.id
  }

  get id() {
    return this._id
  }

  get meta() {
    return this._meta
  }

  get name() {
    return this._meta.name
  }
}
