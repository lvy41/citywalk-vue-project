import request from '@/utils/request'

// 我的奖杯：总数、按类型数量、类型清单与最近获得
export const getMyTrophyAPI = () => request.get('/trophy/my')
