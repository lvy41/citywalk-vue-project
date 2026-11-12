import request from "@/utils/request"
/**
 * @description 省市区地区树（Home 搜索面板、Map 地区选择共用）
 */
export function getAreaTreeAPI() {
  return request({
    url: "/area/tree",
    method: "get"
  })
}
/**
 * @description 获取地图打卡点位，支持cityId城市筛选
 */
export function getMapPoints(params) {
  return request({
    url: "/map/points",
    method: "get",
    params
  })
}
/**
 * @description 获取附近路线，支持lng/lat/radius/tag/cityId
 */
export function getNearRoute(params) {
  return request({
    url: "/map/nearRoute",
    method: "get",
    params
  })
}
/**
 * @description 根据路线id获取轨迹点数组，用于绘制折线
 */
export function getRoutePath(routeId) {
  return request({
    url: "/map/routePath",
    method: "get",
    params: { routeId }
  })
}
