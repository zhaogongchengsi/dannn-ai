import { Store } from './store'

interface ConfigData {
  window: {
    width: number
    height: number
  }
  theme: string
}

export class Config extends Store<ConfigData> {
  constructor() {
    super({
      name: 'config',
      defaultData: {
        window: {
          width: 900,
          height: 670,
        },
        theme: 'auto',
      },
    })
  }
}
