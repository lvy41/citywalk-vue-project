import request from '@/utils/request'

// 打卡：lat/lng 为前端定位得到的实际坐标
export const submitCheckinAPI = (data) => request.post('/checkin/submit', data)
// 某条路线的打卡进度
export const getCheckinStatusAPI = (routeId) => request.get('/checkin/status', { params: { routeId } })
// 我的打卡记录（按路线聚合）
export const getMyCheckinAPI = () => request.get('/checkin/my')
// 奖杯数
export const getTrophyAPI = () => request.get('/checkin/trophy')
// 删除我在某条路线的打卡记录
export const deleteMyCheckinRouteAPI = (routeId) => request.delete('/checkin/route', { params: { routeId } })
// 从首页路线创建（或取回）我的打卡路线副本
export const createMyCheckinRouteAPI = (sourceRouteId) => request.post('/checkin/route/create', { sourceRouteId })
// 我的打卡路线列表
export const getMyCheckinRoutesAPI = () => request.get('/checkin/route/my')
// 打卡副本中某个点位（index 从 0 开始）
export const checkinRoutePointAPI = (id, index) => request.post(`/checkin/route/${id}/point`, { index })
