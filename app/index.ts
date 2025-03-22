import { BrowserWindow } from 'electron'

export function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  window.loadFile('index.html')

  return window
}

console.log(process.env.MODE)
