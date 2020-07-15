/*
 * @Author: duchengdong
 * @Date: 2020-05-03 11:36:47
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-10 23:39:36
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View ,Text,ScrollView} from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { initWordList} from '../../actions/counter'
import './index.scss'
import {WORDDATA} from '../../constants/counter' 
import RightImg from './right-turn-flat.png'
import API from '../../constants/API'
import {requestApi} from '../../constants/utils'

const titleTxt={
'1':'日语初级（上册）单词',
'2':'日语初级（下册）单词',
'3':'日语中级（上册）单词',
'4':'日语中级（下册）单词',
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  initWordList (wordList,wordType) {
    dispatch(initWordList(wordList,wordType))
  }
}))

export default  class Index extends Component {
    config = {
      navigationBarTitleText: '背单词',
      disableScroll: true
    }
    constructor(props){
        super(props)
        this.state = {
            type: undefined,
            wordList: [],
            windowHeight:0,
            isRequest: true,
            scrollTop: 0,
            offset:0
        }
    }
    componentWillMount () {
        // console.log(this.$router.params) // 输出 { id: '2', type: 'test' }
        // console.log(this.props.counter)
        const info = Taro.getSystemInfoSync()
        const { windowHeight,windowWidth } = info
        if(this.props.counter.wordType!=this.$router.params.type){
          const type = this.$router.params.type
          let recordWordId = Taro.getStorageSync(String(type))
          Taro.setNavigationBarTitle({title:titleTxt[type]})
          let startId = recordWordId?recordWordId:0
          Taro.showLoading({
            title: '拼命加载中...'
          })
          requestApi(`${API.getWordList}?bookid=${type}&size=20&sq=1&wordid=${startId}`,'get',null).then(res => {
            this.setState({
                type,
                wordList: res,
                windowHeight,
                windowWidth,
                isRequest: false,
                recordWordId
            })
            this.props.initWordList(res,type)
            Taro.hideLoading()
          })
        }else{
          let recordWordId = Taro.getStorageSync(String(this.props.counter.wordType))
          this.setState({
            type: this.props.counter.wordType,
            wordList: this.props.counter.wordList,
            windowHeight,
            windowWidth,
            recordWordId,
            isRequest: false
          })
        }
    }

    componentDidMount(){
      // console.log('componentDidMount')
      let {recordWordId} = this.state
      this.setScrollTop(recordWordId)
      Taro.showShareMenu({
        withShareTicket: true
      })
    }
  
    componentWillReceiveProps (nextProps) {
      // console.log(this.props, nextProps,'*****')
      if(this.props.counter.wordList.length!=nextProps.counter.wordList.length){
        this.setState({
          wordList: nextProps.counter.wordList
        })
      }
    }
  
    componentWillUnmount () {
      // console.log('unmount')
      // const {type,wordList} = this.state
      // this.props.initWordList(wordList,type)
    }
  
    componentDidShow () {
      // console.log('componentDidShow')
      let recordWordId = Taro.getStorageSync(String(this.state.type))
      this.setScrollTop(recordWordId)
      Taro.showShareMenu({
        withShareTicket: true
      })
    }
  
    componentDidHide () {
      // console.log('hide')
      // const {type,wordList} = this.state
      // this.props.initWordList(wordList,type)
    }

    setScrollTop = (recordWordId)=>{
      const {wordList,windowWidth,offset} = this.state
      if(recordWordId){
        let current = wordList.findIndex(v => v.wordId==recordWordId)
        console.log(wordList,'------')
        this.setState({
          scrollTop: current*Math.floor(114*windowWidth/750)+offset,
          offset: offset?0:1
        })
      }
    }

    goTo = (id) => {
      Taro.navigateTo({
        url:'/pages/wordcard/index?wordId='+id
      })
    }

    scrollHandle = (e)=> {
      const {windowHeight,isRequest,type,wordList,windowWidth,offset} = this.state
      console.log(e.target.scrollHeight-e.target.scrollTop-windowHeight)
      console.log(isRequest)
      if(e.target.scrollHeight-e.target.scrollTop-windowHeight<100&&!isRequest){
        console.log('向下加载数据')
        this.setState({
          isRequest: true
        })
        requestApi(`${API.getWordList}?bookid=${type}&size=20&sq=1&wordid=${wordList[wordList.length-1].wordId}`,'get',null).then(res => {
          let newList = wordList.concat(res)
          this.setState({
              wordList: newList,
              isRequest: false
          })
          this.props.initWordList(newList,type)
        })
      }else if(e.target.scrollTop<20&&!isRequest){
        if(wordList[0].wordId==1) return
        console.log('向上加载数据')
        this.setState({
          isRequest: true
        })
        requestApi(`${API.getWordList}?bookid=${type}&size=20&sq=0&wordid=${wordList[0].wordId}`,'get',null).then(res => {
          if(res.length>0){
            let newList = res.concat(wordList)
            this.setState({
                wordList: newList,
                isRequest: false,
                scrollTop: res.length*Math.floor(114*windowWidth/750)+offset,
                offset: offset?0:1
            })
            this.props.initWordList(newList,type)
          }else{
            this.setState({
                wordList: res.concat(wordList),
                isRequest: false
            })
          }
        })
      }
    }

    // scrollToLowerHandle = ()=>{
    //   const {isRequest,type,wordList} = this.state
    //   if(!isRequest){
    //     console.log('向下加载数据')
    //     this.setState({
    //       isRequest: true
    //     })
    //     requestApi(`${API.getWordList}?bookid=${type}&size=20&sq=1&wordid=${wordList[wordList.length-1].wordId}`,'get',null).then(res => {
    //       let newList = wordList.concat(res)
    //       this.setState({
    //           wordList: newList,
    //           isRequest: false
    //       })
    //       this.props.initWordList(newList,type)
    //     })
    //   }
    // }
    // scrollToUpperHandle = ()=>{
    //   const {isRequest,type,wordList,windowWidth,offset} = this.state
    //   if(!isRequest){
    //     if(wordList[0].wordId==1) return
    //     console.log('向上加载数据')
    //     this.setState({
    //       isRequest: true
    //     })
    //     requestApi(`${API.getWordList}?bookid=${type}&size=20&sq=0&wordid=${wordList[0].wordId}`,'get',null).then(res => {
    //       if(res.length>0){
    //         let newList = res.concat(wordList)
    //         this.setState({
    //             wordList: newList,
    //             isRequest: false,
    //             scrollTop: res.length*Math.floor(114*windowWidth/750)+offset,
    //             offset: offset?0:1
    //         })
    //         this.props.initWordList(newList,type)
    //       }else{
    //         this.setState({
    //             wordList: res.concat(wordList),
    //             isRequest: false
    //         })
    //       }
    //     })
    //   }
    // }
    render () {
      const {type,wordList,scrollTop} = this.state
      return (
        <ScrollView 
          className='page-word-wrapper'
          scrollY
          scrollTop={scrollTop}
          onScroll={this.scrollHandle}
          // lowerThreshold={100}
          // upperThreshold={20}
          // onScrollToLower={this.scrollToLowerHandle}
          // onScrollToUpper={this.scrollToUpperHandle}
        >
          <View className="page-word">
              {/* <View className="page-word-title">{titleTxt[type]}</View> */}
              {
                wordList.map((v,i) => {
                  return (
                    <View className="wordList" key={v.wordId} style={{border:i==v.length-1?'0 none':''}} onClick={()=>{this.goTo(v.wordId)}}>
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
            </View>
        </ScrollView>
      )
    }
}
