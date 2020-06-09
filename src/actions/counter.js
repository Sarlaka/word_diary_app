/*
 * @Author: duchengdong
 * @Date: 2020-05-03 10:48:28
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-01 16:14:47
 * @Description: 
 */
import {
  CHANGE,
  INIT_WORD_LIST,
  UPDATE_WORD,
  INIT_COLLECT_WORD
} from '../constants/counter'

// 切换模式
export function change() {
  return {
    type: CHANGE
  }
}

// 初始化单词列表
export function initWordList (wordList,wordType) {
  return {
    type:INIT_WORD_LIST,
    wordList,
    wordType
  }
}
// 更改单词状态
export function updateWordStatus (bookId,wordId,wordStatus) {
  return {
    type: UPDATE_WORD,
    bookId,
    wordId,
    wordStatus
  }
}

// 初始化收藏单词
export function initCollectWord (wordList) {
  return {
    type:INIT_COLLECT_WORD,
    wordList
  }
}
