import { join } from 'lodash'

export default {
  files: [
    'app_dist/**/*',
    'node_modules/**/*',
    'public/**/*',
    'package.json',
    '!.dannn',
  ],
  directories: {
    buildResources: './public',
  },
  extraFiles: [
    {
      from: './drizzle',
      to: 'resources/drizzle',
      filter: [
        '**/*',
      ],
    },
    ...([
      'openai',
      'socket.io-client',
      'std-env',
    ].map(item => ({
      from: join('node_modules', item),
      to: join('node_modules', item),
      filter: [
        '**/*',
      ],
    }))),
  ],
  asar: true,
  appId: 'com.zhaozunhong.app',
  productName: 'Dannn AI',
  mac: {
    target: 'dmg',
  },
  win: {
    target: 'nsis',
    icon: './public/favicon.ico',
  },
  nsis: {
    oneClick: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    installerIcon: './public/favicon.ico',
    uninstallerIcon: './public/favicon.ico',
    uninstallDisplayName: 'Uninstall Dannn AI',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Dannn AI',
  },
  appImage: {
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${name}-setup.${ext}',
  },
  npmRebuild: false,
}
