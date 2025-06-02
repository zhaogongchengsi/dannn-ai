import { Store } from './store'

interface ConfigData {
  window: {
    width: number
    height: number
  }
  theme: string
  currentChatId?: number
}

export class Config extends Store<ConfigData> {
  constructor() {
    super({
      name: 'config',
      defaultData: {
        window: {
          width: 1280,
          height: 800,
        },
        theme: 'auto',
      },
    })
  }
}
