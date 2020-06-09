/*
 * @Author: duchengdong
 * @Date: 2020-06-01 11:30:43
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-02 14:00:12
 * @Description: 
 */ 
import Taro, { Component } from '@tarojs/taro'
import { View ,Button,Textarea} from '@tarojs/components'
import userImg from './user.jpeg'
import './index.scss'

export default  class Index extends Component {
    config = {
      navigationBarTitleText: '反馈&建议'
    }
    constructor(props){
        super(props)
        this.state = {
            questionTxt:''
        }
    }
    componentWillMount(){
    }
    componentWillReceiveProps (nextProps) {
      console.log(this.props, nextProps)
    }
  
    componentWillUnmount () { }
  
    componentDidShow () { }
  
    componentDidHide () { }
    questionIpt=(e)=>{
        this.setState({
            questionTxt: e.target.value
        })
    }
    submitHandle = ()=>{
        const {questionTxt} = this.state
        console.log(questionTxt)
    }
    render () {
      const {questionTxt} = this.state
      return (
        <View className='page_questions'>
            <View className="title">问题描述：</View>
            <Textarea className="questions" onInput={this.questionIpt} value={questionTxt}></Textarea>
            <View className="tips">tips：谢谢各位提交的反馈和建议，我们会不断改进哒~</View>
            <View className="submitBtn" onClick={this.submitHandle}>提交</View>
        </View>
      )
    }
}