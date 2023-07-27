import { URL } from 'url'

export function removePort (originalUrl: string) {
  const urlObj = new URL(originalUrl)

  /**
   * @artifactory adds a https port in the middle of their urls and URL.parse will not return ports in that range
   * protects against ports that match their protocol from being retained within the urlObj
   */
  if (urlObj.port === '') {
    return urlObj.href
  }

  urlObj.port = ''
  return urlObj.toString()
}
