import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { app, protocol } from 'electron'
import { join } from 'pathe'
import { EXTENSIONS_ROOT, PROTOCOL_NAME } from './constant'
import { templateReplace } from './utils'
import workerTmpl from './worker.tmpl'

export async function createDannnProtocol() {
  protocol.registerSchemesAsPrivileged([
    { scheme: PROTOCOL_NAME, privileges: { secure: true, standard: true, stream: true, supportFetchAPI: true, corsEnabled: true } },
  ])

  await app.whenReady()

  protocol.handle(PROTOCOL_NAME, async (request) => {
    const url = new URL(request.url)

    if (url.hostname === 'loader.extension') {
      const script = templateReplace(workerTmpl, { url: JSON.stringify(url.pathname + url.search) })
      const response = createScriptResponse(script)
      return response
    }

    if (url.hostname === 'import.extension') {
      const name = url.searchParams.get('name')
      if (!name) {
        return new Response('Worker Missing name', {
          status: 400,
          statusText: 'Worker Missing name',
        })
      }

      // /Users/you name/Library/Application Support/@dannn/app/.dannn/extensions + {name} + /{pathname}.js
      const filePath = join(EXTENSIONS_ROOT, name, url.pathname)

      if (!['.js', '.cjs', '.mjs'].some(ext => filePath.endsWith(ext))) {
        return new Response('Worker Invalid extension', {
          status: 400,
          statusText: 'Worker Invalid extension',
        })
      }

      if (!existsSync(filePath)) {
        return new Response('Worker Not found', {
          status: 404,
          statusText: `Worker Not found ${filePath}`,
        })
      }

      const scriptContent = await readFile(filePath, 'utf-8')

      return createScriptResponse(scriptContent)
    }

    return new Response('Not found', {
      status: 404,
      statusText: `Not found: ${url.hostname}`,
    })
  })
}

function createScriptResponse(code: string): Response {
  const blob = new Blob([code], { type: 'application/javascript' })
  return new Response(blob, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': `application/javascript; charset=utf-8`,
      'Access-Control-Allow-Origin': '*', // 允许 CORS
      'Cache-Control': 'no-store', // 防止 Worker 缓存
    },
  })
}
