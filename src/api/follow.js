import request from '@/utils/request'

export function getFollowListAPI() {
  return request({ url: '/follow/list', method: 'get' })
}

export function getFansListAPI() {
  return request({ url: '/follow/fans', method: 'get' })
}

export function getFollowStatusAPI(targetId) {
  return request({ url: `/follow/status/${targetId}`, method: 'get' })
}

export function followUserAPI(targetId) {
  return request({ url: `/follow/${targetId}`, method: 'post' })
}

export function unfollowUserAPI(targetId) {
  return request({ url: `/follow/${targetId}`, method: 'delete' })
}
