/*
 * @Author: duchengdong
 * @Date: 2020-05-03 11:36:47
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-04 22:20:41
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View ,Button} from '@tarojs/components'
import API from '../../constants/API'
import RightImg from '../word/right-turn-flat.png'
import './index.scss'

export default  class Index extends Component {
    config = {
      navigationBarTitleText: '我的页面',
      navigationBarBackgroundColor:'#ffffff',
      disableScroll: true
    }
    constructor(props){
        super(props)
        this.state = {
          isAuth: false,
          username: '',
          avatar: ''
        }
    }
    componentWillMount(){
      try {
        console.log('*******')
        var value = Taro.getStorageSync('loginInfo')
        if (value) {
          // Do something with return value
          let loginInfo = JSON.parse(value)
          this.setState({
            isAuth: true,
            username: loginInfo.username,
            avatar: loginInfo.avatar
          })
        }
      } catch (e) {
        // Do something when catch error
      }
    }
    componentDidMount(){
      this.Tucao = Taro.requirePlugin('tucao').default;
      this.Tucao.init(void(0), {
        productId:163852,
        navigateTo: Taro.navigateTo
      });
    
    }
    componentWillReceiveProps (nextProps) {
      console.log(this.props, nextProps)
    }
  
    componentWillUnmount () { }
  
    componentDidShow () { }
  
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
                  isAuth: true,
                  username: loginInfo.username,
                  avatar: loginInfo.avatar
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
      const {isAuth,username,avatar} = this.state
      return (
        <View className='page_my'>
          <View className="page_my_inner">
          {
            isAuth
            ?<View className='profileBox'>
                <Image className='avatar' src={avatar}/>
                <Text className='username'>{username}</Text>
              </View>
            :<Button
                className='authBtn'
                openType='getUserInfo'
                onGetUserInfo={this.wxLoginHandle}
            >
                用户授权
            </Button>
          }
          {
            isAuth?
           <View className="content">
              <View className='list' onClick={()=>{
                    Taro.navigateTo({
                    url:'/pages/collections/index'
                  })
                }}>
                    <Text className='txt'>收藏本</Text>
                    <Image src={RightImg} style={{width:'16px',height:'16px'}}/>
              </View>
              <View className='list' onClick={()=>{
                var value = Taro.getStorageSync('loginInfo')
                let loginInfo = JSON.parse(value)
                this.Tucao.go({
                  avatar: loginInfo.avatar,
                  nickname: loginInfo.username,
                  openid: loginInfo.user_id
                })
            }}>
                <Text className='txt'>吐个槽</Text>
                <Image src={RightImg} style={{width:'16px',height:'16px'}}/>
              </View>
            </View>
            :''
          }
          </View>
        </View>
      )
    }
}