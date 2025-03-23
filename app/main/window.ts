import process from 'node:process'
import { BrowserWindow } from 'electron'

export class Window extends BrowserWindow {
  constructor() {
    const mode = process.env.MODE
    super({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
      },
    })

    if (mode === 'dev') {
      this.loadURL('http://localhost:3001')
    }
    else {
      this.loadFile('./index.html')
    }
  }

  show() {
    return new Promise<void>((resolve) => {
      this.once('ready-to-show', () => {
        super.show()
        resolve()
      })
    })
  }
}
