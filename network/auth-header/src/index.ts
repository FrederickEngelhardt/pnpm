import nerfDart from 'nerf-dart'
import { URL } from 'url'
import { getAuthHeadersFromConfig } from './getAuthHeadersFromConfig'

export function createGetAuthHeaderByURI (
  opts: {
    allSettings: Record<string, string>
    userSettings?: Record<string, string>
  }
) {
  const authHeaders = getAuthHeadersFromConfig({
    allSettings: opts.allSettings,
    userSettings: opts.userSettings ?? {},
  })
  if (Object.keys(authHeaders).length === 0) return () => undefined
  return getAuthHeaderByURI.bind(null, authHeaders, getMaxParts(Object.keys(authHeaders)))
}

function getMaxParts (uris: string[]) {
  return uris.reduce((max, uri) => {
    const parts = uri.split('/').length
    return parts > max ? parts : max
  }, 0)
}

function getAuthHeaderByURI (authHeaders: Record<string, string>, maxParts: number, uri: string): string | undefined {
  const nerfed = nerfDart(uri)
  const parts = nerfed.split('/')
  for (let i = Math.min(parts.length, maxParts) - 1; i >= 3; i--) {
    const key = `${parts.slice(0, i).join('/')}/` // eslint-disable-line
    if (authHeaders[key]) return authHeaders[key]
  }
  const urlWithoutPort = removePort(uri)
  if (urlWithoutPort !== uri) {
    return getAuthHeaderByURI(authHeaders, maxParts, urlWithoutPort)
  }
  return undefined
}

function removePort (originalUrl: string) {
  const hasHTTPS = originalUrl.match(':443')
  const urlObj = new URL(originalUrl)

  /**
   * @artifactory adds a https port in the middle of their urls and URL.parse will not return ports in that range
   */
  if (hasHTTPS && urlObj.port === '') {
    return urlObj.href
  }

  if (urlObj.port === '') return originalUrl

  urlObj.port = ''
  return urlObj.toString()
}
