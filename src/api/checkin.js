import request from '@/utils/request'

// 打卡：lat/lng 为前端定位得到的实际坐标
export const submitCheckinAPI = (data) => request.post('/checkin/submit', data)
// 某条路线的打卡进度
export const getCheckinStatusAPI = (routeId) => request.get('/checkin/status', { params: { routeId } })
// 我的打卡记录（按路线聚合）
export const getMyCheckinAPI = () => request.get('/checkin/my')
// 奖杯数
export const getTrophyAPI = () => request.get('/checkin/trophy')
