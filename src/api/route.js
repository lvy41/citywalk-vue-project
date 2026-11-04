import request from '@/utils/request'
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
  })
}
