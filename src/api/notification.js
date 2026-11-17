import request from '@/utils/request'

// 互动通知：点赞、评论、收藏、新关注
export function getInteractionNotificationsAPI() {
  return request({ url: '/notification/interactions', method: 'get' })
}

// 系统通知
export function getSystemNotificationsAPI() {
  return request({ url: '/notification/system', method: 'get' })
}
