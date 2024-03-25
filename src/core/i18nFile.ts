const path = require('path')
const fs = require('fs-extra')

export type Config = {
  single: boolean
  filename: string
  entry: string
  outdir: string
  exclude: string[]
  extensions: string[]
  useChineseKey: boolean
  projectDirname: string
}

const defaultConfig: Config = {
  single: false,
  filename: 'zh_cn',
  entry: 'src',
  outdir: 'src/locales',
  exclude: ['src/locales'],
  extensions: ['.js', '.vue', '.ts'],
  useChineseKey: false,
  projectDirname: ''
}

export default class VueI18n {
  /**起始索引 */
  private index = 1
  /**中文 key 哈希字典 */
  private messagesHash: Record<string, string> = {}
  /**i18n 输出的字典{ key: '值' } */
  private messages: Record<string, string> = {}
  /**入口路径 */
  private rootPath = ''

  /**默认配置 */
  private config = defaultConfig
  static defaultConfig = defaultConfig

  /**获取项目配置 */
  getConfig() {
    return this.config
  }

  setMessage(messages: Record<string, string>) {
    this.messages = messages
    Object.keys(messages).forEach((key) => {
      this.messagesHash[messages[key]] = key
    })
  }

  getMessage() {
    return this.messages
  }

  getHashMessage() {
    return this.messagesHash
  }

  /**根据 message 初始化 index */
  initIndex() {
    if (this.config.useChineseKey) {
      return
    } // 使用中文键不需要索引
    this.index = Math.max(
      0,
      ...Object.keys(this.messages).map((item) => Number(item.replace(/^[^\d]+/, '') || 0) || 0)
    )
    this.index++
  }

  /**
   * 合并配置
   * @param config
   */
  mergeConfig(config: any) {
    this.config = Object.assign(this.config, config)
    // path.join 的作用是把 ./test/vue.js 和 test/vue.js 统一转化成 test/vue.js
    this.rootPath = path.join(this.config.projectDirname, this.config.entry)
  }

  setMessageItem(key: string, value: string) {
    this.messages[key] = value
    this.setMessagesHashItem(value, key)
  }

  private setMessagesHashItem(key: string, value: string) {
    this.messagesHash[key] = value
  }

  /**
   * 获取 message 的 key， 如果没有则新建一个
   * @param chinese
   * @param file
   * @returns
   */
  getCurrentKey(chinese: string, file: string): string {
    if (this.messagesHash[chinese]) {
      return this.messagesHash[chinese]
    }
    if (this.config.useChineseKey) {
      return chinese
    }
    let key = this.getPreKey(file) + String(this.index)
    this.index = this.index + 1
    return key.toLowerCase()
  }

  /**删除 message 中的键值 */
  deleteMessageKey(key: string) {
    delete this.messagesHash[this.messages[key]]
    delete this.messages[key]
  }

  /**
   * 删除所有数据
   */
  deleteMessages() {
    this.messagesHash = {}
    this.messages = {}
    this.index = 1
  }

  private getPreKey(file: string) {
    return `${path
      .relative(this.rootPath, file)
      .replace(/^\.+\\/, '')
      .replace(/[\\/\\\\-]/g, '_')
      .replace(/\..*$/, '')}_`
  }

  /**获取所有文件路径 */
  getAllFiles(dir: string) {
    let results: string[] = []
    fs.readdirSync(dir).forEach((item: string) => {
      item = path.join(dir, item)
      // 排除文件夹
      if (this.config.exclude.includes(dir.replace('\\', '/'))) {
        return
      }
      if (fs.lstatSync(item).isDirectory()) {
        results.push(...this.getAllFiles(item))
      } else {
        if (this.config.extensions.indexOf(path.extname(item).toLowerCase()) > -1) {
          results.push(item)
        }
      }
    })

    return results
  }
}

export const VueI18nInstance = new VueI18n()
