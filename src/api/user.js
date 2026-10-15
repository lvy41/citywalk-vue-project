import request from '@/utils/request'
/**
 * 用户登录接口
 * @param {Object} data - { username, password }
 * @returns {Promise}
 */
export function loginAPI(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}
/**
 * 用户注册接口
 * @param {Object} data - { username, password, phone }
 * @returns {Promise}
 */
export function registerAPI(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}
/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfoAPI() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
/**
 * 更新用户信息
 * @param {Object} data - { nickname, avatar }
 * @returns {Promise}
 */
export function updateUserInfoAPI(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}
/**
 * 修改密码
 * @param {Object} data - { oldPassword, newPassword }
 * @returns {Promise}
 */
export function changePasswordAPI(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}
