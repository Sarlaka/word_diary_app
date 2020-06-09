/*
 * @Author: duchengdong
 * @Date: 2020-05-11 21:46:03
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-01 16:57:44
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View,Text} from '@tarojs/components'
import { connect } from '@tarojs/redux';
import { updateWordStatus} from '../../actions/counter'
import yuyinImg from '../WordCard/yuyin.png';
import liekImg from '../WordCard/like.png';
import unlikeImg from '../WordCard/unlike.png';
import API from '../../constants/API'
import {requestApi} from '../../constants/utils'
import '../WordCard/index.scss';

@connect(({
  counter
}) => ({
  counter
}), (dispatch) => ({
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
        }
    }
    startX=0
    componentWillMount () {
        console.log(this.$router.params) // 输出 { id: '2', type: 'test' }
        console.log(this.props.counter)
        const wordId = this.$router.params.wordId
        const bookId = this.$router.params.bookId
        let current = this.props.counter.collectWords.findIndex(v => v.bookId==bookId&&v.wordId==wordId)
        console.log(current)
        this.setState({
            current
        })
    }
    componentWillUnmount () {
        console.log('unmount')
        const {current} = this.state
        let currentWord = this.props.counter.collectWords[current]
        Taro.setStorage({
            key:String(currentWord.bookId),
            data:String(currentWord.wordId)
        })
    }

    componentDidMount(){
        this.innerAudioContext = Taro.createInnerAudioContext()
        this.innerAudioContext.onError((res) => {
            console.log(res.errMsg)
            console.log(res.errCode)
        })
    }

    componentDidShow () {}

    componentDidHide () {
        console.log('hide')
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
        console.log(e.changedTouches[0].pageX,this.startX)
        if(Math.abs(offsetX)<40||(offsetX>0&&current==0)||(offsetX<0&&current==counter.collectWords.length-1)){
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
        let {current,direction,isStart} = this.state
        console.log(isStart,current)
        if(isStart=='2'){
            if(direction==0){
                // 左滑
                this.setState({
                    current:current+1,
                    offsetX: 0,
                    isStart: false
                })
            }else{
                // 右滑
                this.setState({
                    current:current-1,
                    offsetX: 0,
                    isStart: false
                })
            }
        }else{
            this.setState({
                offsetX: 0,
                isStart: false
            })
        }
    }
    
    playWordSound = (e)=>{
        e.stopPropagation()
        const {current} = this.state
        const {counter} = this.props
        this.innerAudioContext.src = counter.collectWords[current].wordSound
        this.innerAudioContext.play()
    }
    playExampleSound = (e)=>{
        e.stopPropagation()
        const {current} = this.state
        const {counter} = this.props
        this.innerAudioContext.src = counter.collectWords[current].exampleSound
        this.innerAudioContext.play()
    }

    collectWord = (e) => {
        e.stopPropagation()
        const {current} = this.state
        const {counter,updateWordStatus} = this.props
        const {collectWords} = counter
        requestApi(`${API.collectWord}?bookid=${collectWords[current].bookId}&collect=${collectWords[current].wordStatus?0:1}&wordid=${collectWords[current].wordId}`,'get',null).then(res => {
            updateWordStatus(collectWords[current].bookId,collectWords[current].wordId,collectWords[current].wordStatus?0:1)
            Taro.showToast({
                title: collectWords[current].wordStatus?"取消成功":'收藏成功',
                icon: 'success',
                duration: 2000
              })
        })
    }
    render(){
        const {current,offsetX,isStart} = this.state
        const {counter} = this.props
        return (
            <View className='page-word-card'>
                <View className="wrapper"
                    onTouchStart={this.touchStartHandle}
                    onTouchMove={this.touchMoveHandle}
                    onTouchEnd={this.touchEndHandle}
                    onTransitionEnd={this.transitionEndHandle}
                    style={{transform: `translateX(${offsetX})`,transition:isStart?'all ease-in-out .15s':'none'}}
                >
                    <View key={counter.collectWords[current-1].wordId} className="word-card left" style={{visibility:current-1>-1?'visible':'hidden'}}>
                        <View className='lineBox'>
                            <Text className="line">单词</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>                        <View className='word'>{counter.collectWords[current-1].word}</View>
                        <View className='word-translate'>
                            <Text>{counter.collectWords[current-1].wordTranslation} </Text>
                            /
                            <Text className='type'> {counter.collectWords[current-1].type}</Text>
                        </View>
                        <View className='lineBox'>
                            <Text className="line">例句</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>
                        <View className='example'>{counter.collectWords[current-1].exampleText}</View>
                        <View className='example-translate'>{counter.collectWords[current-1].exampleTranslate}</View>
                        <View className="likeBtn" style={{width:'36px',height:'36px'}}>
                            <Image className='likeImg' src={counter.collectWords[current-1].wordStatus?liekImg:unlikeImg} style={{width:'20px',height:'20px'}}/>
                        </View>
                    </View>
                    <View key={counter.collectWords[current].wordId} className="word-card center">
                        <View className='lineBox'>
                            <Text className="line">单词</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}} onTouchEnd={this.playWordSound}/>
                        </View>
                        <View className='word'>{counter.collectWords[current].word}</View>
                        <View className='word-translate'>
                            <Text>{counter.collectWords[current].wordTranslation} </Text>
                            /
                            <Text className='type'> {counter.collectWords[current].type}</Text>
                        </View>
                        <View className='lineBox'>
                            <Text className="line">例句</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}} onTouchEnd={this.playExampleSound}/>
                        </View>
                        <View className='example'>{counter.collectWords[current].exampleText}</View>
                        <View className='example-translate'>{counter.collectWords[current].exampleTranslate}</View>
                        <View className="likeBtn" style={{width:'36px',height:'36px'}} onTouchEnd={this.collectWord}>
                            <Image className='likeImg' src={counter.collectWords[current].wordStatus?liekImg:unlikeImg} style={{width:'20px',height:'20px'}}/>
                        </View>
                    </View>
                    <View key={counter.collectWords[current+1].wordId} className="word-card right" style={{visibility:current+1<counter.collectWords.length?'visible':'hidden'}}>
                        <View className='lineBox'>
                            <Text className="line">单词</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>                        <View className='word'>{counter.collectWords[current+1].word}</View>
                        <View className='word-translate'>
                            <Text>{counter.collectWords[current+1].wordTranslation} </Text>
                            /
                            <Text className='type'> {counter.collectWords[current+1].type}</Text>
                        </View>
                        <View className='lineBox'>
                            <Text className="line">例句</Text><Image className='yuyin' src={yuyinImg} style={{width:'24px',height:'24px'}}/>
                        </View>
                        <View className='example'>{counter.collectWords[current+1].exampleText}</View>
                        <View className='example-translate'>{counter.collectWords[current+1].exampleTranslate}</View>
                        <View className="likeBtn" style={{width:'36px',height:'36px'}}>
                            <Image className='likeImg' src={counter.collectWords[current+1].wordStatus?liekImg:unlikeImg} style={{width:'20px',height:'20px'}}/>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}