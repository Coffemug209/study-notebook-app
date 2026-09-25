interface Env {
  DATABASE_URL?: string
  DATABASE_URL_UNPOOLED?: string
  UPLOADTHING_TOKEN?: string
  NODE_ENV?: string
  CORS_ORIGIN?: string
}

let appHandler: any = null

async function getHandler() {
  if (!appHandler) {
    const { default: serverless } = await import('serverless-http')
    const { default: app } = await import('./app.js')
    appHandler = serverless(app, { provider: 'aws' })
  }
  return appHandler
}

export default {
  async fetch(request: Request, env: Env, ctx: unknown): Promise<Response> {
    try {
      if (env.DATABASE_URL) process.env.DATABASE_URL = env.DATABASE_URL
      if (env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL_UNPOOLED = env.DATABASE_URL_UNPOOLED
      if (env.UPLOADTHING_TOKEN) process.env.UPLOADTHING_TOKEN = env.UPLOADTHING_TOKEN
      if (env.CORS_ORIGIN) process.env.CORS_ORIGIN = env.CORS_ORIGIN

      // Handle preflight OPTIONS directly
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-uploadthing-version, x-uploadthing-fe-package',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
          },
        })
      }

      const handler = await getHandler()

      const url = new URL(request.url)
      const headers: Record<string, string> = {}
      request.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value
      })

      let body: string | undefined = undefined
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.text()
      }

      const event = {
        version: '2.0',
        routeKey: '$default',
        rawPath: url.pathname,
        rawQueryString: url.search.length > 1 ? url.search.substring(1) : '',
        cookies: [],
        headers,
        queryStringParameters: Object.fromEntries(url.searchParams.entries()),
        requestContext: {
          http: {
            method: request.method,
            path: url.pathname,
            protocol: 'HTTP/1.1',
            sourceIp: request.headers.get('cf-connecting-ip') || '127.0.0.1',
            userAgent: request.headers.get('user-agent') || '',
          },
        },
        body,
        isBase64Encoded: false,
      }

      const result: any = await handler(event as any, ctx as any)

      const responseHeaders = new Headers()
      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          if (value !== undefined && value !== null) {
            responseHeaders.set(key, String(value))
          }
        }
      }
      if (result.multiValueHeaders) {
        for (const [key, values] of Object.entries(result.multiValueHeaders)) {
          if (Array.isArray(values)) {
            for (const v of values) {
              responseHeaders.append(key, String(v))
            }
          }
        }
      }

      if (!responseHeaders.has('Access-Control-Allow-Origin')) {
        responseHeaders.set('Access-Control-Allow-Origin', '*')
      }

      const responseBody = result.isBase64Encoded
        ? Buffer.from(result.body || '', 'base64')
        : result.body

      return new Response(responseBody, {
        status: result.statusCode || 200,
        headers: responseHeaders,
      })
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: err?.message || String(err),
          stack: err?.stack,
          name: err?.name,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }
  },
}
