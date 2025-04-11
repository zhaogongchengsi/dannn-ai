import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    './base/index',
  ],
  rollup: {
    emitCJS: true,
    cjsBridge: true,
  },
  declaration: true,
  clean: true,
  failOnWarn: false,
  outDir: 'client_dist',
})
