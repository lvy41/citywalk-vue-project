import request from '@/utils/request'
export function getTagList() {
  return request({
    url: '/tag/list',
    method: 'get'
  })
}
