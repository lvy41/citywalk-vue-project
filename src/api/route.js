import request from '@/utils/request'

/**
 * 获取路线详情+有序点位
 * @param {number} routeId
 */
export function getRouteDetailAPI(routeId) {
  return request({
    url: '/route/detail',
    method: 'get',
    params: { routeId }
  })
}
