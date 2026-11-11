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

// 点赞 / 取消点赞
export function likeRouteAPI(routeId){
  return request({
    url:'/route/like',
    method:'post',
    params:{ routeId }
  })
}

export function unlikeRouteAPI(routeId){
  return request({
    url:'/route/like',
    method:'delete',
    params:{ routeId }
  })
}

export function getRouteDetailFullAPI(routeId) {
  return request({ url: "/route/detailFull", method: "get", params: { routeId } })
}

// 路线分页列表（首页用，避免一次拉全库）
export function getRouteListAPI(params) {
  return request({ url: "/route/list", method: "get", params })
}

// 路线评论列表（未登录可读）
export function getRouteCommentsAPI(routeId) {
  return request({ url: "/route/comment/list", method: "get", params: { routeId } })
}

// 发表评论（需要登录）
export function addRouteCommentAPI(data) {
  return request({ url: "/route/comment", method: "post", data })
}
