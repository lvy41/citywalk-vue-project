/**
 * 前端本地解析 JWT（只读取 payload 里的 exp，不校验签名）。
 * 用途：在把过期 token 带给后端公开接口之前先识别出来，
 * 避免后端把“登录态过期”按“未登录”处理，导致点赞/收藏/关注等状态回退成空心。
 */

function decodePayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder('utf-8').decode(bytes))
  } catch (e) {
    return null
  }
}

/** 取 token 载荷里的过期时间（unix 秒），解析失败返回 null */
export function getTokenExp(token) {
  const payload = decodePayload(token)
  return payload && typeof payload.exp === 'number' ? payload.exp : null
}

/**
 * 判断 token 是否已过期。
 * @param {string} token
 * @param {number} skewSec 余量（秒），提前 skewSec 视为过期，避免临界点仍发请求
 * @returns {boolean} 无 exp 字段（解析不出）时返回 false，交给后端 401 兜底
 */
export function isTokenExpired(token, skewSec = 30) {
  const exp = getTokenExp(token)
  if (exp == null) return false
  return Date.now() / 1000 >= exp - skewSec
}
