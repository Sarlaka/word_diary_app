/*
 * @Author: duchengdong
 * @Date: 2020-05-11 21:46:03
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-14 14:41:20
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View,Text,Input,Switch} from '@tarojs/components'
import { connect } from '@tarojs/redux';
import { initWordList,updateWordStatus} from '../../actions/counter'
import {AtProgress, AtIcon,AtModal, AtModalHeader, AtModalContent, AtModalAction } from "taro-ui"
import yuyinImg from './yuyin.png';
import liekImg from './like.png';
import unlikeImg from './unlike.png';
import API from '../../constants/API'
import {requestApi} from '../../constants/utils'
import './index.scss';

@connect(({
  counter
}) => ({
  counter
}), (dispatch) => ({
  initWordList(wordList, wordType) {
    dispatch(initWordList(wordList, wordType))
  },
  updateWordStatus(bookId,wordId,wordStatus){
    dispatch(updateWordStatus(bookId,wordId,wordStatus))
  }
}))

export default class WordCard extends Component {
    config = {
        navigationBarTitleText: '单词卡片',
        disableScroll: true
    }

    constructor(props){
        super(props)
        this.state = {
           current: -1,
           offsetX:0,
           isStart: false,
           direction: 0,
           requestLock: false,
           isAutoPlaying: false,
           duration:2,
           repeat: 1,
           isOpened: false,
           processTotal: 1000
        }
    }
    startX=0
    componentWillMount () {
        // console.log(this.$router.params) // 输出 { id: '2', type: 'test' }
        // console.log(this.props.counter)
        const wordId = this.$router.params.wordId
        let current = this.props.counter.wordList.findIndex(v => v.wordId==wordId)
        // console.log(current)
        const processData = {
            1: 999,
            2: 1022,
            3: 1569,
            4: 1773
        }
        this.setState({
            current,
            processTotal: processData[this.props.counter.wordType]
        })
    }
    componentWillUnmount () {
        // console.log('unmount')
        const {current} = this.state
        let currentWord = this.props.counter.wordList[current]
        Taro.setStorage({
            key:String(currentWord.bookId),
            data:String(currentWord.wordId)
        })
    }

    componentDidMount(){
        this.innerAudioContext = Taro.createInnerAudioContext()
        this.innerAudioContext.onError((res) => {
            // console.log(res.errMsg)
            // console.log(res.errCode)
        })
        this.innerAudioContext.onPlay =(e) => {
            // console.log('pppppp')
        }
        this.innerAudioContext.onEnded =(e) => {
            // console.log('llllll')
        }
        Taro.showShareMenu({
            withShareTicket: true
        })
    }

    componentDidShow () {
        Taro.showShareMenu({
            withShareTicket: true
        })
    }

    componentDidHide () {
        // console.log('hide')
    }
    touchStartHandle = (e) => {
        this.innerAudioContext.stop()
        this.startX = e.changedTouches[0].pageX
    }
    touchMoveHandle = (e) => {
        this.setState({
            offsetX: e.touches[0].pageX - this.startX + 'px'
        })
    }
    touchEndHandle = (e) => {
        const {current} = this.state
        let {counter} = this.props
        let offsetX = e.changedTouches[0].pageX - this.startX
        // console.log(e.changedTouches[0].pageX,this.startX)
        if(Math.abs(offsetX)<40||(offsetX>0&&current==0)||(offsetX<0&&current==counter.wordList.length-1)){
            this.setState({
                offsetX: 0,
                isStart: '1',
            })
        }else if(offsetX<-40){
            // 向左滑
            this.setState({
                offsetX: '-110%',
                isStart: '2',
                direction: 0
            })
        }else{
            // 向右滑
            this.setState({
                offsetX: '110%',
                isStart: '2',
                direction: 1
            })
        }
        
    }
    transitionEndHandle=()=>{
        let {current,direction,isStart,requestLock} = this.state
        let {counter} = this.props
        // console.log(isStart,current)
        if(isStart=='2'){
            if(direction==0){
                // 左滑
                this.setState({
                    current:current+1,
                    offsetX: 0,
                    isStart: false
                })
                if(!requestLock&&current+5>counter.wordList.length){
                    // 请求新数据
                    this.setState({
                        requestLock: true
                    })
                    this.loadMoreLeft()
                }
            }else{
                // 右滑
                this.setState({
                    current:current-1,
                    offsetX: 0,
                    isStart: false
                })
                if(!requestLock&&current-5<0){
                    // 请求新数据
                    this.setState({
                        requestLock: true
                    })
                    this.loadMoreRight()
                }
            }
            this.stopAutoPlay()
        }else{
            this.setState({
                offsetX: 0,
                isStart: false
            })
        }
    }

    // 向左滑
    loadMoreLeft = () => {
        const {counter,initWordList} = this.props
        const {wordType,wordList} = counter
        requestApi(`${API.getWordList}?bookid=${wordType}&size=20&sq=1&wordid=${wordList[wordList.length-1].wordId}`,'get',null).then(res => {
            let newWordList = wordList.concat(res)
            // console.log(newWordList)
            initWordList(newWordList,wordType)
            this.setState({
                requestLock: false
            })
          })
    }
    // 向右滑
    loadMoreRight = () => {
        const {counter,initWordList} = this.props
        const {wordType,wordList} = counter
        if(wordList[0].wordId==1) return
        requestApi(`${API.getWordList}?bookid=${wordType}&size=20&sq=0&wordid=${wordList[0].wordId}`,'get',null).then(res => {
            let newWordList = res.concat(wordList)
            initWordList(newWordList,wordType)
            this.setState({
                current: this.state.current+res.length,
                requestLock: false
            })
          })
    }
    playWordSound = (e)=>{
        e.stopPropagation()
        const {current} = this.state
        const {counter} = this.props
        //销毁自动播放的音乐实例
        this.innerAudioContext1&&this.innerAudioContext1.destroy()
        this.innerAudioContext2&&this.innerAudioContext2.destroy()
        this.innerAudioContext.src = counter.wordList[current].wordSound
        this.innerAudioContext.play()
    }
    playExampleSound = (e)=>{
        e.stopPropagation()
        const {current} = this.state
        const {counter} = this.props
        //销毁自动播放的音乐实例
        this.innerAudioContext1&&this.innerAudioContext1.destroy()
        this.innerAudioContext2&&this.innerAudioContext2.destroy()
        this.innerAudioContext.src = counter.wordList[current].exampleSound
        this.innerAudioContext.play()
    }

    collectWord = (e) => {
        e.stopPropagation()
        const {current} = this.state
        const {counter,updateWordStatus} = this.props
        const {wordList} = counter
        requestApi(`${API.collectWord}?bookid=${wordList[current].bookId}&collect=${wordList[current].wordStatus?0:1}&wordid=${wordList[current].wordId}`,'get',null).then(res => {
            updateWordStatus(wordList[current].bookId,wordList[current].wordId,wordList[current].wordStatus?0:1)
            Taro.showToast({
                title: wordList[current].wordStatus?"取消成功":'收藏成功',
                icon: 'success',
                duration: 2000
              })
        })
    }

    playHandle = () =>{
        const {isAutoPlaying} = this.state
        if(isAutoPlaying){
            // console.log('开始播放')
            this.autoPlayHandle()
        }else{
            // console.log('停止播放')
            this.innerAudioContext1&&this.innerAudioContext1.destroy()
            this.innerAudioContext2&&this.innerAudioContext2.destroy()
            clearTimeout(this.timer)
        }
    }
    innerAudioContext1 = null
    innerAudioContext2 = null
    timer = null
    autoPlayHandle = () => {
        let {current,requestLock,duration,repeat} = this.state
        let {counter} = this.props
        let currentWord = counter.wordList[current]
        let wordPlayCount = repeat
        let examplePlayCount = repeat
        this.innerAudioContext1 = Taro.createInnerAudioContext()
        // 播放单词
        this.innerAudioContext1.onPlay(()=>{
            wordPlayCount--
            console.log(wordPlayCount,'wordPlayCount')
        })
        this.innerAudioContext1.onEnded((e) => {
            console.log('单词播放结束') 
            if(wordPlayCount>0){
                this.timer=setTimeout(() => {
                    this.innerAudioContext1.play()
                }, duration*1000);
                return
            }   
            this.innerAudioContext1.destroy()
            // 播放例句
            this.innerAudioContext2 = Taro.createInnerAudioContext()
            this.innerAudioContext2.onPlay(()=>{
                examplePlayCount--
                console.log(examplePlayCount,'examplePlayCount')
            })
            this.innerAudioContext2.onEnded((e) => {
                if(examplePlayCount>0){
                    this.timer=setTimeout(() => {
                        this.innerAudioContext2.play()
                    }, duration*1000);
                    return
                } 
                this.innerAudioContext2.destroy()
                current = current+1
                if(!requestLock&&current+5>counter.wordList.length){
                    // 请求新数据
                    this.setState({
                        requestLock: true
                    })
                    this.loadMoreLeft()
                }
                // 延时后执行
                this.timer=setTimeout(() => {
                    this.setState({
                        current
                    },()=>{
                        this.autoPlayHandle()
                    })
                }, duration*1000);
            })
            this.innerAudioContext2.src = currentWord.exampleSound
            // 延时后执行
            this.timer=setTimeout(() => {
                this.innerAudioContext2.play()
            }, duration*1000);
        })
        this.innerAudioContext1.src = currentWord.wordSound
        this.innerAudioContext1.play()
    }
    // 设置相关
    showSetting = ()=>{
        this.setState({
            isOpened: true
        })
    }
    closeSetting = () =>{        
        this.setState({
            isOpened: false
        })
    }
    switchHandle = (e) => {
        // console.log(e.target.value)
        this.setState({
            isAutoPlaying: e.target.value
        },()=>{
            this.playHandle()
        })
    }
    durationIpt = (e)=>{
        if(isNaN(e.target.value)){
            console.log('输入的不是有效数字')
        }
        this.setState({
            duration:e.target.value
        })
    }
    repeatIpt = (e)=>{
        if(isNaN(e.target.value)){
            console.log('输入的不是有效数字')
        }
        this.setState({
            repeat:e.target.value
        })
    }
    // 停止自动播放
    stopAutoPlay = () => {
        this.setState({
            isAutoPlaying: false
        },()=>{
            this.playHandle()
        })
    }
    // 开始自动播放
    startAutoPlay = ()=>{
        this.setState({
            isAutoPlaying: true
        },()=>{
            this.playHandle()
        })
    }
    render(){
        const {current,offsetX,isStart,isAutoPlaying,duration,repeat,isOpened,processTotal} = this.state
        const {counter} = this.props
        let percent = Number((counter.wordList[current]?counter.wordList[current].wordId:1)/processTotal*100).toFixed(2)
        return (
            <View className='page-word-card'>
                <View className='settingsBox' onClick={this.showSetting}>
                    <AtIcon value="settings" color="#a0a0a0"></AtIcon>
                    设置
                </View>
                <View className='processBox'>
                    <AtProgress percent={Number(percent)} color='#f29404' strokeWidth={10}/>
                </View>
                <View className="wrapper"
                    onTouchStart={this.touchStartHandle}
                    onTouchMove={this.touchMoveHandle}
                    onTouchEnd={this.touchEndHandle}
                    onTransitionEnd={this.transitionEndHandle}
                    style={{transform: `translateX(${offsetX})`,transition:isStart?'all ease-in-out .15s':'none'}}
                >
                    <View key={counter.wordList[current-1].wordId} className="word-card left" style={{visibility:current-1>-1?'visible':'hidden'}}>
                        <View className='lineBox'>
                            <Text className="line">单词</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>                        <View className='word'>{counter.wordList[current-1].word}</View>
                        <View className='word-translate'>
                            <Text>{counter.wordList[current-1].wordTranslation} </Text>
                            /
                            <Text className='type'> {counter.wordList[current-1].type}</Text>
                        </View>
                        <View className='lineBox'>
                            <Text className="line">例句</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>
                        <View className='example'>{counter.wordList[current-1].exampleText}</View>
                        <View className='example-translate'>{counter.wordList[current-1].exampleTranslate}</View>
                        <View className="likeBtn" style={{width:'36px',height:'36px'}}>
                            <Image className='likeImg' src={counter.wordList[current-1].wordStatus?liekImg:unlikeImg} style={{width:'20px',height:'20px'}}/>
                        </View>
                    </View>
                    <View key={counter.wordList[current].wordId} className="word-card center">
                        <View className='lineBox'>
                            <Text className="line">单词</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}} onTouchEnd={this.playWordSound}/>
                        </View>
                        <View className='word'>{counter.wordList[current].word}</View>
                        <View className='word-translate'>
                            <Text>{counter.wordList[current].wordTranslation} </Text>
                            /
                            <Text className='type'> {counter.wordList[current].type}</Text>
                        </View>
                        <View className='lineBox'>
                            <Text className="line">例句</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}} onTouchEnd={this.playExampleSound}/>
                        </View>
                        <View className='example'>{counter.wordList[current].exampleText}</View>
                        <View className='example-translate'>{counter.wordList[current].exampleTranslate}</View>
                        <View className="likeBtn" style={{width:'36px',height:'36px'}} onTouchEnd={this.collectWord}>
                            <Image className='likeImg' src={counter.wordList[current].wordStatus?liekImg:unlikeImg} style={{width:'20px',height:'20px'}}/>
                        </View>
                    </View>
                    <View key={counter.wordList[current+1].wordId} className="word-card right" style={{visibility:current+1<counter.wordList.length?'visible':'hidden'}}>
                        <View className='lineBox'>
                            <Text className="line">单词</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>
                        <View className='word'>{counter.wordList[current+1].word}</View>
                        <View className='word-translate'>
                            <Text>{counter.wordList[current+1].wordTranslation} </Text>
                            /
                            <Text className='type'> {counter.wordList[current+1].type}</Text>
                        </View>
                        <View className='lineBox'>
                            <Text className="line">例句</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>
                        <View className='example'>{counter.wordList[current+1].exampleText}</View>
                        <View className='example-translate'>{counter.wordList[current+1].exampleTranslate}</View>
                        <View className="likeBtn" style={{width:'36px',height:'36px'}}>
                            <Image className='likeImg' src={counter.wordList[current+1].wordStatus?liekImg:unlikeImg} style={{width:'20px',height:'20px'}}/>
                        </View>
                    </View>
                </View>
                <View className="duration duration-switch">
                    <View className="label">自动播放：</View>
                    <Switch color='#4173ff' checked={isAutoPlaying} onChange={this.switchHandle}/>
                </View>
                <AtModal 
                    isOpened={isOpened}
                >
                    <AtModalHeader>设置</AtModalHeader>
                    <AtModalContent>
                        <View className="settingBox" style={{display:isOpened?'block':'none'}}>
                            <View className="duration">
                                <View className="label">播放间隔(s)：</View>
                                <Input className='form-input' type='number' value={duration} onInput={this.durationIpt}/>
                            </View>
                            <View className="duration">
                                <View className="label">重复次数(次)：</View>
                                <Input className='form-input' type='number' value={repeat}  onInput={this.repeatIpt}/>
                            </View>
                            {/* <View className="duration">
                                <View className="label">自动播放：</View>
                                <Switch color='#4173ff' checked={isAutoPlaying} onChange={this.switchHandle}/>
                            </View> */}
                        </View>
                    </AtModalContent>
                    <AtModalAction>
                        <Button onClick={this.closeSetting}>取消</Button>
                        <Button onClick={this.closeSetting}>确定</Button>
                    </AtModalAction>
                </AtModal>
            </View>
        )
    }
}