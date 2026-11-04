import request from '@/utils/request'

/**
 * 用户登录接口
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.password
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
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.password
 * @param {string} data.phone
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
 * 获取当前登录用户信息（请求头携带token）
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
 * @param {Object} data
 * @param {string} [data.nickname]
 * @param {string} [data.avatar]
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
 * @param {Object} data
 * @param {string} data.oldPassword
 * @param {string} data.newPassword
 * @returns {Promise}
 */
export function changePasswordAPI(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}
