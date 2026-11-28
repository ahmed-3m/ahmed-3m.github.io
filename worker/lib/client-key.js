// The per-client rate-limit key (spec 007, research R5): one IPv4 address, or one IPv6 /64.

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
const HEXTET = /^[0-9a-f]{1,4}$/i

function ipv4(text) {
  const match = IPV4.exec(text)
  if (!match) return null
  const parts = match.slice(1).map(Number)
  return parts.every((part) => part <= 255) ? parts.join('.') : null
}

/** Eight lowercase four-digit hextets, or null when the text is not an IPv6 address. */
function ipv6Hextets(text) {
  if (!text.includes(':')) return null
  const halves = text.split('::')
  if (halves.length > 2) return null
  const toParts = (half) => (half ? half.split(':') : [])
  const expandTail = (parts) => {
    // An IPv4 tail (`::ffff:192.0.2.1`) counts as two hextets.
    const last = parts[parts.length - 1]
    if (last && last.includes('.')) {
      const v4 = ipv4(last)
      if (!v4) return null
      const [a, b, c, d] = v4.split('.').map(Number)
      return [...parts.slice(0, -1), ((a << 8) | b).toString(16), ((c << 8) | d).toString(16)]
    }
    return parts
  }
  let head = toParts(halves[0])
  let tail = toParts(halves[1] ?? '')
  if (halves.length === 1) {
    head = expandTail(head)
    if (!head || head.length !== 8) return null
  } else {
    tail = expandTail(tail)
    if (!tail) return null
    if (head.length + tail.length > 7) return null
    head = [...head, ...Array(8 - head.length - tail.length).fill('0'), ...tail]
  }
  if (!head.every((part) => HEXTET.test(part))) return null
  return head.map((part) => part.toLowerCase().padStart(4, '0'))
}

/**
 * `CF-Connecting-IP` → limiter key. IPv4 as is; IPv6 as its first four hextets plus
 * `::/64` (an IPv4-mapped IPv6 address counts as its IPv4 address); anything else `unknown`.
 */
export function clientKey(ip) {
  if (typeof ip !== 'string') return 'unknown'
  const text = ip.trim()
  const v4 = ipv4(text)
  if (v4) return v4
  const hextets = ipv6Hextets(text)
  if (!hextets) return 'unknown'
  const mapped = hextets.slice(0, 5).every((h) => h === '0000') && hextets[5] === 'ffff'
  if (mapped) {
    const n = (h) => parseInt(h, 16)
    return [n(hextets[6]) >> 8, n(hextets[6]) & 255, n(hextets[7]) >> 8, n(hextets[7]) & 255].join('.')
  }
  return `${hextets.slice(0, 4).join(':')}::/64`
}
