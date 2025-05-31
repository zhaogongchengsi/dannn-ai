import type { ClientOptions } from 'openai'
import type { InfoAI } from '~/node/database/service/ai'
import OpenAI from 'openai'

export class AI extends OpenAI {
  meta: InfoAI
  constructor(meta: InfoAI, clientOpt: ClientOptions) {
    super(clientOpt)
    this.meta = meta
  }
}
