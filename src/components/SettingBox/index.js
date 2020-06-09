/*
 * @Author: duchengdong
 * @Date: 2020-05-10 15:29:31
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-05-10 15:33:45
 * @Description: 
 */
import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text ,Image} from '@tarojs/components'
import { connect } from '@tarojs/redux'
import {change } from '../../actions/counter'
import {AtIcon} from 'taro-ui'
import './index.scss'

@connect(({ counter }) => ({
    counter
  }), (dispatch) => ({
    change () {
      dispatch(change())
    }
}))
  
export default class SettingBox extends Component {
    render(){
        const {change,counter} = this.props
        const {mode} =counter
        return (
            <View className='settingsBox' onClick={change}>
                <AtIcon value="settings" color="#a0a0a0"></AtIcon>
                {
                    mode
                    ?<View className='mode'>
                    日译中
                    </View>
                    :<View className='mode'>
                    中译日
                    </View>
                }
            </View>
        )
    }
}