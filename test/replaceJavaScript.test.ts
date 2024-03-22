import replaceJavaScript  from '../src/core/replaceJavaScript';
import VueI18n from '../src/core/i18nFile'
import _const from '../src/core/const'
const path = require('path')

const configFile = _const.CustomSettingFileName + '.js'

const message = {
  error: () => { },
  warn: () => { }
}

describe('replaceJavaScript 测试', () => {
  const configPath = path.join(process.cwd(), configFile)
  const config = require(configPath)
  config.entry = 'testExample/origin'
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({ ...config, projectDirname: process.cwd() })
  })
  it('普通中文替换', () => {
    const content = `const name = '你好';\nconst age = '小明'`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `const name = i18n.t('test_1');\nconst age = i18n.t('test_2')`
    )
  })

  it('不替换含单行注释//', () => {
    const content = `// 注释哈哈哈\nconst name = '你好'`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `// 注释哈哈哈\nconst name = i18n.t('test_1')`
    )
  })

  it('处理协议//不认为是注释', () => {
    const content = `const name = 'http://baidu.com'`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `const name = 'http://baidu.com'`
    )
  })
  

  it('不替换含中文注释/**/', () => {
    const content = `/**注释哈哈哈**/\nconst name = '你好'`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `/**注释哈哈哈**/\nconst name = i18n.t('test_1')`
    )
  })
  
  it('含多行注释的中文替换', () => {
    const content = `/**\n**注释哈哈哈\n**测试\n**/\nconst name = '你好'`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `/**\n**注释哈哈哈\n**测试\n**/\nconst name = i18n.t('test_1')`
    )
  })

  it('不替换i18n.$t()', () => {
    const content = `const name = i18n.t('test_1_你好')`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `const name = i18n.t('test_1_你好')`
    )
  })

  it('不替换map中文键', () => {
    const content = `const name = { '你好' : false, '他哈super': '1', age: '哈哈' }`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `const name = { '你好' : false, '他哈super': '1', age: i18n.t('test_1') }`
    )
  })

  it('不替换require()', () => {
    const content = `const image = require('@/assets/美女.png')`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `const image = require('@/assets/美女.png')`
    )
  })

  it('不替换console.log()', () => {
    const content = `console.log('大哥')`
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `console.log('大哥')`
    )
  })

  it('拼接字符串替换', () => {
    const content = 'const image = `美女${this.age}帅哥`'
    const result = replaceJavaScript(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `const image = i18n.t('test_1', [this.age])`
    )
    expect(VueI18nInstance.getMessage().test_1).toBe(
      `美女{0}帅哥`
    )

    const content2 = 'const image = `美女帅哥`'
    const result2 = replaceJavaScript(
      content2,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result2).toBe(
      `const image = i18n.t('test_2')`
    )
  })
})
