import request from '@/utils/request'

// 我的成就：已解锁/总数、当前佩戴称号、每条成就线的累计数与三级称号
export const getMyAchievementAPI = () => request.get('/achievement/my')

// 佩戴称号
export const wearTitleAPI = (data) => request.post('/achievement/wear', data)
