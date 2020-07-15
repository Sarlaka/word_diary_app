/*
 * @Author: duchengdong
 * @Date: 2020-05-03 10:48:28
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-12 15:09:49
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'

import Index from './pages/index/index'

import configStore from './store'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const store = configStore()

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/my/index',
      'pages/word/index',
      'pages/wordcard/index',
      'pages/questions/index',
      'pages/collections/index',
      'pages/collectionword/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fce7f3',
      // navigationBarBackgroundColor:'#ffffff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
    tabBar: {
      color:'#A0A0A0',
      selectedColor:'#ffd656',
      list:[{
        pagePath:'pages/index/index',
        text:'背词',
        iconPath:'./public/images/home.png',
        selectedIconPath:'./public/images/home_select.png'	
      },{
        pagePath:'pages/my/index',
        text:'我的',
        iconPath:'./public/images/user.png',
        selectedIconPath:'./public/images/user_select.png'	
      }],
      custom: false
    },
    navigateToMiniProgramAppIdList: [
      "wx8abaf00ee8c3202e"
    ]
  }

  componentDidMount () {
  }

  componentDidShow () {
  }

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
