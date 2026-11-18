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
 * 发送邮箱验证码（公开接口，无需 Token）
 * @param {Object} data
 * @param {string} data.email
 * @param {string} data.purpose register | forgot
 * @param {string} [data.username]
 * @returns {Promise}
 */
export function sendEmailCodeAPI(data) {
  return request({
    url: '/user/email-code',
    method: 'post',
    data
  })
}

/**
 * 用户注册接口
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.password
 * @param {string} data.email
 * @param {string} data.emailCode
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
 * 忘记密码：邮箱验证码校验后重置密码（公开接口，无需 Token）
 * @param {Object} data
 * @param {string} data.username
 * @param {string} data.email
 * @param {string} data.emailCode
 * @param {string} data.newPassword
 * @returns {Promise}
 */
export function forgotPasswordAPI(data) {
  return request({
    url: '/user/forgot-password',
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

/**
 * 注销当前账号
 * @param {Object} data
 * @param {string} data.password
 * @returns {Promise}
 */
export function cancelAccountAPI(data) {
  return request({
    url: '/user/cancel',
    method: 'post',
    data
  })
}

/** 他人公开主页 */
export function getUserProfileAPI(userId) {
  return request({ url: `/user/profile/${userId}`, method: 'get' })
}

/** 按用户ID/用户名/昵称搜索用户 */
export function searchUserAPI(keyword) {
  return request({ url: '/user/search', method: 'get', params: { keyword } })
}

/** 他人发布的路线 */
export function getUserRoutesAPI(userId) {
  return request({ url: `/user/${userId}/routes`, method: 'get' })
}
