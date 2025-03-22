#!/usr/bin/env node

import { defineCommand, runMain } from 'citty'
import build from './commands/build'

const main = defineCommand({
  meta: {
    name: 'dannny',
    version: '0.0.1',
    description: 'Dannny CLI',
  },
  subCommands: {
    build,
  },
})

runMain(main)
