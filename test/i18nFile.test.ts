import VueI18n, { VueI18nInstance } from '../src/core/i18nFile';
import _const from '../src/core/const'
const path = require('path')

const configFile = _const.CustomSettingFileName + '.js'

describe('VueI18nInstance 测试', () => {

  const configPath = path.join(process.cwd(), configFile)
  const config = require(configPath)
  config.entry = 'testExample/origin'
  // 合并参数
  VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd()})

  it('测试合并配置参数是否OK', () => {
    const mergeConfig = VueI18nInstance.getConfig()
    expect(mergeConfig.projectDirname).toBe(process.cwd())
  })

  it('测试实例生成key值', () => {
    const currentKey = VueI18nInstance.getCurrentKey('你好', 'testExample/origin/test.vue')
    expect(currentKey).toBe('test_1')
  })

  it('测试实例生成key值是否成功复用', () => {
    VueI18nInstance.setMessageItem('haha_1', '你好')
    const currentKey = VueI18nInstance.getCurrentKey('你好', 'testExample/origin/test.vue')
    expect(currentKey).toBe('haha_1')
  })

  it('测试初始化索引', () => {
    const vi = new VueI18n()
    vi.mergeConfig({...config, projectDirname: process.cwd()})
    vi.initIndex()
    const currentKey = vi.getCurrentKey('你好', 'testExample/origin/test.vue')
    expect(currentKey).toBe('test_1')

    vi.setMessage({ haha_1: '撒旦发', haha_2: '所发放的'})
    vi.initIndex()
    const currentKey2 = vi.getCurrentKey('你好', 'testExample/origin/test.vue')
    expect(currentKey2).toBe('test_3')
  })


  it('测试删除key值后生成新的key值', () => {
    const vi = new VueI18n()
    vi.mergeConfig({...config, projectDirname: process.cwd()})
    vi.setMessage({ haha_1: '撒旦发', haha_2: '所发放的'})
    vi.initIndex()
    const currentKey = vi.getCurrentKey('撒旦发', 'testExample/origin/test.vue')
    expect(currentKey).toBe('haha_1')
    vi.deleteMessageKey('haha_1')
    const currentKey2 = vi.getCurrentKey('撒旦发', 'testExample/origin/test.vue')
    expect(currentKey2).toBe('test_3')
  })

  it('测试getAllFile', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd()})
    const list = VueI18nInstance.getAllFiles('src')
    // 这里第一个为 const 文件，不排除后面会变动
    expect(list[0]).toBe('src\\core\\const.ts')
  })

  it('测试配置文件exclude排除文件夹', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd(), exclude: ['src/core']})
    const list = VueI18nInstance.getAllFiles('src')
    // 这里第一个为 const 文件，不排除后面会变动
    expect(list[0] === 'src\\core\\const.ts').toBeFalsy()
  })

  it('测试配置文件extensions限制文件类型', () => {
    const VueI18nInstance = new VueI18n()
    // src 文件夹下均为 ts 文件，所以是没有 .vue 文件的
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd(), extensions: ['.vue']})
    const list = VueI18nInstance.getAllFiles('src')
    expect(list.length === 0).toBeTruthy()
  })

  it('测试使用中文键', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd(), useChineseKey: true})
    const currentKey = VueI18nInstance.getCurrentKey('撒旦发', 'testExample/origin/test.vue')
    expect(currentKey).toBe('撒旦发')
  })
  
  it('测试getMessage&getHashMessage', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd()})
    VueI18nInstance.setMessage({ haha_1: '撒旦发'})
    const message = VueI18nInstance.getMessage()
    const messagesHash =VueI18nInstance.getHashMessage()
    expect(message.haha_1).toBe('撒旦发')
    expect(messagesHash.撒旦发).toBe('haha_1')
  })

  
  it('测试中文键初始化索引', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd(), useChineseKey: true})
    VueI18nInstance.setMessage({ haha_1: '撒', haha_2: '所'})
    VueI18nInstance.initIndex()
    const currentKey2 = VueI18nInstance.getCurrentKey('你好', 'testExample/origin/test.vue')
    expect(currentKey2).toBe('你好')
  })

  it('删除所有数据', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd(), useChineseKey: true})
    VueI18nInstance.setMessage({ haha_1: '撒', haha_2: '所'})
    VueI18nInstance.deleteMessages()
    const result = VueI18nInstance.getMessage().haha_1
    expect(result).toBeUndefined()
  })
})