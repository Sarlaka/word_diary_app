/*
 * @Author: duchengdong
 * @Date: 2020-05-19 22:08:35
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-05-25 21:55:23
 * @Description: 
 */
import Taro from '@tarojs/taro'

export const requestApi = (url,method,data) => {
  return new Promise((resolve,reject)=> {
    Taro.getStorage({
        key: 'token',
        success: function (res) {
          let token = res.data
          console.log(token)
          Taro.request({
            url: url, //仅为示例，并非真实的接口地址
            method: method,
            data: data?JSON.stringify(data):null,
            header: {
              'content-type': 'application/json', // 默认值
              'token': token
            },
            success: function (res) {
              res = res.data
              if (res.code == 100) {
                resolve(res.data)
              } else if (res.code == 200) {
                //重新存储token
                Taro.setStorage({
                  key:"token",
                  data:res.access_token
                })
                resolve(res.data)
              } else {
                wx.clearStorageSync()
                Taro.reLaunch({
                  url: '/pages/my/index'
                })
              }
            }
          })
        },
        fail: function (err) {
            reject(err)
        },
      })
  })
}