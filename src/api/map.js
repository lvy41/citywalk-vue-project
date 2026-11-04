// src/api/map.js
import request from "@/utils/request"

/**
 * @description 获取地图所有打卡点位
 * @returns {Promise} pointList: {id, pointName, desc, longitude, latitude, tag, imageUrl, routeId}[]
 */
export function getMapPoints() {
  return request({
    url: "/map/points",
    method: "get"
  })
}

/**
 * @description 获取附近路线
 * @param {number} lng 经度
 * @param {number} lat 纬度
 * @param {number} radius 搜索半径，默认3000米
 * @returns {Promise} nearRouteList: {id, routeName, city, duration}[]
 */
export function getNearRoute(lng, lat, radius = 3000) {
  return request({
    url: "/map/nearRoute",
    method: "get",
    params: { lng, lat, radius }
  })
}

/**
 * @description 根据路线id获取轨迹点数组，用于绘制折线
 * @param {number|string} routeId 路线ID
 * @returns {Promise} path: {longitude, latitude}[]
 */
export function getRoutePath(routeId) {
  return request({
    url: "/map/routePath",
    method: "get",
    params: { routeId }
  })
}

/**
 * 【可选扩展，答辩加分】按标签筛选点位
 * @param {string} tag 标签：老街 / 美食 / 人文 / 夜景
 */
export function getPointByTag(tag) {
  return request({
    url: "/map/points",
    method: "get",
    params: { tag }
  })
}
