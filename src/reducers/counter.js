/*
 * @Author: duchengdong
 * @Date: 2020-05-03 10:48:28
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-01 15:43:07
 * @Description: 
 */
import {CHANGE,INIT_WORD_LIST,UPDATE_WORD,INIT_COLLECT_WORD } from '../constants/counter'

const INITIAL_STATE = {
  mode: true,
  wordType: -1,
  wordList: [],
  collectWords: []
}

export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case CHANGE:
      return {
        ...state,
        mode: !state.mode
      }
    case INIT_WORD_LIST: 
      return {
        ...state,
        wordList: action.wordList,
        wordType: action.wordType
      }
    case UPDATE_WORD:
      console.log(action.bookId,action.wordId)
      return {
        ...state,
        wordList: state.wordList.map(v => (action.bookId==v.bookId&&action.wordId==v.wordId?{
          ...v,
          wordStatus: action.wordStatus
        }:v)),
        collectWords: state.collectWords.map(v => (action.bookId==v.bookId&&action.wordId==v.wordId?{
          ...v,
          wordStatus: action.wordStatus
        }:v))
      }
    case INIT_COLLECT_WORD:
      return {
        ...state,
        collectWords: action.wordList
      }
     default:
       return state
  }
}
