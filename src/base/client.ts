import { Ipc } from './ipc'

/**
 * Client class for handling IPC communication.
 */
class Client extends Ipc {
  constructor() {
    super()
  }
}

export const client = new Client()
