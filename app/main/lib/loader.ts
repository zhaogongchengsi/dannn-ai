import { Store } from './store'

export class Loader extends Store<Extensions> {
  constructor() {
    super({
      name: 'extensions',
      defaultData: [],
    })
  }
}
