/*
 * @Author: duchengdong
 * @Date: 2020-05-18 22:04:06
 * @LastEditors: duchengdong
 * @LastEditTime: 2020-06-03 11:00:20
 * @Description: 
 */ 

const API_PATH = 'https://www.lemonduck.cn'

const API = {
    login: `${API_PATH}/login/`,
    getWordList: `${API_PATH}/words/`,
    collectWord: `${API_PATH}/collect/`,
    collections: `${API_PATH}/collections/`
}

export default API