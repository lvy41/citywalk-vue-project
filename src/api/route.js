import request from '@/utils/request'
<<<<<<< HEAD

/**
 * 获取路线详情+有序点位
 * @param {number} routeId
 */
export function getRouteDetailAPI(routeId) {
  return request({
    url: '/route/detail',
    method: 'get',
    params: { routeId }
=======
// 查询用户发布路线接口
export function getUserPublishRouteAPI(){
  return request({
    url:'/route/user-publish',
    method:'get'
  })
}
// 点赞列表查询接口
export function getUserLikeListAPI(){
  return request({
    url:'/route/user-like',
    method:'get'
>>>>>>> 347f91d955943ff7d92daec9466ec3067abbce4a
  })
}
