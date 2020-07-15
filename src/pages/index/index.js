/*
 * @Author: duchengdong
 * @Date: 2020-05-03 10:48:28
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-10 23:26:22
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View, Text ,Image,Button} from '@tarojs/components'
import { connect } from '@tarojs/redux'
import SettingBox from '../../components/SettingBox'
import API from '../../constants/API'


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
      isAuth: false
    }
  }

  goTo = (id) => {
    Taro.navigateTo({
      url:'/pages/word/index?type='+id
    })
    // try {
    //   var value = Taro.getStorageSync('token')
    //   if (value) {
    //     // Do something with return value
    //     Taro.navigateTo({
    //       url:'/pages/word/index?type='+id
    //     })
    //   }else{
    //     // 重新登录
    //     Taro.reLaunch({
    //       url:'/pages/my/index'
    //     })
    //   }
    // } catch (e) {
    //   // Do something when catch error
    //   // 清除缓存，重新登录
    //   wx.clearStorageSync()
    //   Taro.reLaunch({
    //     url: '/pages/my/index'
    //   })
    // }

  }
  componentWillMount(){
    try {
      var value = Taro.getStorageSync('token')
      if (value) {
        // Do something with return value
        this.setState({
          isAuth: true
        })
      }
    } catch (e) {
      // Do something when catch error
      // 清除缓存，重新登录
      this.setState({
        isAuth: false
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

  wxLoginHandle=(auth)=>{
    const self =this
    Taro.login({
      success: (res)=>{
        let data = {
            code: res.code,
            userInfo: auth.detail.rawData,
            cloudID: auth.detail.cloudID,
            encrypted_data: auth.detail.encryptedData,
            iv: auth.detail.iv,
            source:2,
            signature: auth.detail.signature
        }
        Taro.request({
          url: API.login, //仅为示例，并非真实的接口地址
          method: 'POST',
          data: JSON.stringify(data),
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log(res.data.data)
            if(res.data.code=='100'){
              let loginInfo = res.data.data
              let token = res.data.access_token
              self.setState({
                isAuth: true
              })
              Taro.setStorage({
                key:"loginInfo",
                data:JSON.stringify(loginInfo)
              })
              Taro.setStorage({
                key:"token",
                data:token
              })
            }
          }
        })
      },
    })
  }
  render () {
    const {isAuth} = this.state
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
                isAuth?
                <View className="course" key={v.id} onClick={()=>{this.goTo(v.id)}}>
                  <Image src={'https://www.lemonduck.cn/images/book.png'} style={{width:'36px',height:'36px'}}/>
                    <Text className='txt'>{v.text}</Text>
                  <Image src={'https://www.lemonduck.cn/images/arrow.png'} style={{width:'16px',height:'16px'}}/>
                </View>
                :<Button
                    className='course'
                    openType='getUserInfo'
                    onGetUserInfo={this.wxLoginHandle}
                  >
                  <Image src={'https://www.lemonduck.cn/images/book.png'} style={{width:'36px',height:'36px'}}/>
                  <Text className='txt'>{v.text}</Text>
                  <Image src={'https://www.lemonduck.cn/images/arrow.png'} style={{width:'16px',height:'16px'}}/>
                </Button>
              )
            })
          }
        </View>
      </View>
    )
  }
}

export default Index
