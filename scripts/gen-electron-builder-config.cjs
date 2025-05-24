const fs = require('node:fs')
const path = require('node:path')

const pkgPath = path.resolve(__dirname, '../package.json')
const outputPath = path.resolve(__dirname, '../electron-builder.json')

console.log('正在生成 electron-builder.json...')

console.log('当前目录：', __dirname)
// 读取 package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
const keepDeps = pkg.electronKeepDeps || []
// 获取所有 dependencies
const dependencies = Object.keys(pkg.dependencies || {}).filter(dep => keepDeps.includes(dep))

// 生成 extraFiles 配置
const extraFiles = [
  // 保留原有 extraFiles 配置
  ...(pkg.build.extraFiles || []),
  // 为每个依赖生成一条
  ...dependencies.map(dep => ({
    from: `./node_modules/${dep}`,
    to: `node_modules/${dep}`,
    filter: ['**/*'],
  })),
]

// 合并 build 配置
const buildConfig = {
  ...pkg.build,
  extraFiles,
}

// 写入 electron-builder.json
fs.writeFileSync(outputPath, JSON.stringify(buildConfig, null, 2))
console.log('electron-builder.json 已生成，extraFiles 已自动包含所有 dependencies。')
