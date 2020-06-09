/*
 * @Author: duchengdong
 * @Date: 2020-05-03 11:36:47
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-04 21:24:08
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View ,Text,ScrollView} from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { initCollectWord} from '../../actions/counter'
import '../word/index.scss'
import RightImg from '../word/right-turn-flat.png'
import API from '../../constants/API'
import {requestApi} from '../../constants/utils'

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
    initCollectWord (wordList) {
    dispatch(initCollectWord(wordList))
  }
}))

export default  class Index extends Component {
    config = {
      navigationBarTitleText: '单词本',
      disableScroll: true
    }
    constructor(props){
        super(props)
        this.state = {
            wordList: []
        }
    }
    componentWillMount () {
        // console.log(this.$router.params) // 输出 { id: '2', type: 'test' }
        // console.log(this.props.counter)
        Taro.showLoading({
          title: '拼命加载中...'
        })
        requestApi(`${API.collections}`,'get',null).then(res => {
          this.setState({
              wordList: res
          })
          this.props.initCollectWord(res)
          Taro.hideLoading()
        })
    }

    componentDidMount(){
      // console.log('componentDidMount')
    }
    
    componentWillReceiveProps (nextProps) {
      // console.log(this.props, nextProps,'*****')
    }
  
    componentWillUnmount () {
      // console.log('unmount')
      // const {type,wordList} = this.state
      // this.props.initWordList(wordList,type)
    }
  
    componentDidShow () {
      // console.log('componentDidShow')
    }
  
    componentDidHide () {
      // console.log('hide')
      // const {type,wordList} = this.state
      // this.props.initWordList(wordList,type)
    }

    goTo = (bookId,wordId) => {
      Taro.navigateTo({
        url:'/pages/collectionword/index?wordId='+wordId+'&bookId='+bookId
      })
    }

    render () {
      const {wordList} = this.state
      return (
        <ScrollView 
          className='page-word-wrapper'
          scrollY
        >
          <View className="page-word">
              {/* <View className="page-word-title">{titleTxt[type]}</View> */}
              {
                wordList.map((v,i) => {
                  return (
                    <View className="wordList" key={v.wordId} style={{border:i==v.length-1?'0 none':''}} onClick={()=>{this.goTo(v.bookId,v.wordId)}}>
                      <View className='left'>
                        <View className="word">
                          <Text>{v.word} </Text>
                          <Text style={{color:'#f29404',fontWeight:'700'}}>{v.type}</Text>
                        </View>
                        <View className='translate'>{v.wordTranslation}</View>
                      </View>
                      <Image src={RightImg} style={{width:'16px',height:'16px'}}/>
                    </View>
                  )
                })
              }
              {
                wordList.length==0?'暂时还没收藏记录哦~快去收藏吧':''
              }
            </View>
        </ScrollView>
      )
    }
}
