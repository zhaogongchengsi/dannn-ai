import { app, Menu, nativeImage, Tray } from 'electron'
import { resolve } from 'pathe'

export class AppTray {
  private tray: Tray | null = null

  constructor(tooltip: string) {
    const menuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: `Dannn AI ${app.getVersion()}`,
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
          // Logic to quit the application can be added here
        },
      },
    ]
    this.createTray(resolve(__dirname, './public/icon_256X256.png'), tooltip, menuTemplate)
  }

  private createTray(iconPath: string, tooltip: string, menuTemplate: Electron.MenuItemConstructorOptions[]) {
    const icon = nativeImage.createFromPath(iconPath)
    this.tray = new Tray(icon)
    this.tray.setToolTip(tooltip)
    const contextMenu = Menu.buildFromTemplate(menuTemplate)
    this.tray.setContextMenu(contextMenu)
  }

  public destroy() {
    if (this.tray) {
      this.tray.destroy()
      this.tray = null
    }
  }
}
