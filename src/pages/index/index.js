/*
 * @Author: duchengdong
 * @Date: 2020-05-03 10:48:28
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-04 21:03:06
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View, Text ,Image} from '@tarojs/components'
import { connect } from '@tarojs/redux'
import SettingBox from '../../components/SettingBox'

import './index.scss'

const courseList = [{
  id:1,
  text:'日语初级（上册）'
},{
  id:2,
  text:'日语初级（下册）'
},{
  id:3,
  text:'日语中级（上册）'
},{
  id:4,
  text:'日语中级（下册）'
}]

@connect(({ counter }) => ({
  counter
}))

class Index extends Component {

  config = {
    navigationBarTitleText: '日语记单词',
    disableScroll: true
  }

  constructor () {
    super(...arguments)
    this.state = {
     
    }
  }

  goTo = (id) => {
    try {
      var value = Taro.getStorageSync('token')
      if (value) {
        // Do something with return value
        Taro.navigateTo({
          url:'/pages/word/index?type='+id
        })
      }else{
        // 重新登录
        Taro.reLaunch({
          url:'/pages/my/index'
        })
      }
    } catch (e) {
      // Do something when catch error
      // 清除缓存，重新登录
      wx.clearStorageSync()
      Taro.reLaunch({
        url: '/pages/my/index'
      })
    }

  }
  componentDidMount(){
    Taro.showShareMenu({
      withShareTicket: true
    })
  }
  componentWillReceiveProps (nextProps) {
    console.log(this.props, nextProps)
  }

  componentWillUnmount () { }

  componentDidShow () {
    Taro.showShareMenu({
      withShareTicket: true
    })
  }

  componentDidHide () { }

  render () {
    const {} = this.state
    const {counter} = this.props
    const {mode} =counter
    return (
      <View className='index'>
        <View className="top">
          <Text className="title">选择单词课程</Text>
          <SettingBox />
        </View>
        <View className="courseList">
          {
            courseList.map((v,i)=>{
              return (
                <View className="course" key={v.id} onClick={()=>{this.goTo(v.id)}}>
                  <Image src={'https://www.lemonduck.cn/images/book.png'} style={{width:'36px',height:'36px'}}/>
                    <Text className='txt'>{v.text}</Text>
                  <Image src={'https://www.lemonduck.cn/images/arrow.png'} style={{width:'16px',height:'16px'}}/>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }
}

export default Index
