import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './client/index'
  ],
  rollup: {
    emitCJS: true,
    cjsBridge: true,
  },
  declaration: true,
  clean: true,
  failOnWarn: false,
  outDir: 'client_dist'
})
