const path = require('path')
const fs = require('fs-extra')

export type Config = {
  single: boolean
  filename: string
  entry: string
  outdir: string
  exclude: string[]
  extensions: string[]
}

export default class VueI18n {
  /** */
  private index = 1
  /**中文 key 哈希字典 */
  private messagesHash: Record<string, string> = {}
  /**i18n 输出的字典{ key: '值' } */
  private messages: Record<string, string> = {}
  
  /**入口完整路径 */
  private entryPath = ''
  private rootPath = ''

  /**默认配置 */
  private config: Config = {
    single: false,
    filename: 'zh_cn',
    entry: 'src',
    outdir: 'src/locales',
    exclude: ['src/locales'],
    extensions: ['.js', '.vue', '.ts']
  }

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

  /**根据 message 初始化 index */
  initIndex() {
    this.index = Math.max(
      1,
      1,
      ...Object.keys(this.messages).map((item) =>
        Number(item.replace(/^[^\d]+/, '')) || 0
      )
    )
  }

  /**
   * 合并配置
   * @param config 配置
   * @param root 项目根路径
   */
  mergeConfig(config: Config, root: string) {
    this.config = Object.assign(this.config, config)
    this.rootPath = path.join(root)
    this.entryPath = path.join(root, this.config.entry)
  }

  setMessageItem(key: string, value: string) {
    this.messages[key] = value
  }

  setMessagesHashItem(key: string, value: string) {
    this.messagesHash[key] = value
  }

  deleteMessageItem(key: string, value: string) {
    if (this.messages[key]) {
      delete this.messages[key]
    }
    if (this.messagesHash[value]) {
      delete this.messagesHash[value]
    }
  }

  /**
   * 获取 message 的 key， 如果没有则新建一个
   * @param chinese
   * @param file
   * @returns
   */
  getCurrentKey(chinese: string, file: string): string {
    if (this.messagesHash[chinese]) return this.messagesHash[chinese]
    let key = this.getPreKey(file) + this.index
    this.index = this.index + 1
    if (this.messages && !this.messages[key]) return key.toLowerCase()
    return this.getCurrentKey(chinese, file)
  }

  /**
   * 删除 message 中的键值
   * @param key 
   */
  deleteMessageKey(key: string) {
    delete this.messages[key]
  }

  /**
   * 获取当前文件专属 key 前缀
   * @param file 
   * @returns 
   */
  getPreKey(file: string) {
    return `${path
      .relative(this.entryPath, file)
      .replace(/[\\/\\\\-]/g, '_')
      .replace(/\..*$/, '')}_`
  }

  /**
   * 获取当前文件夹下所有文件完整路径
   * @param dir 当前文件夹
   * @returns 
   */
  getAllFiles(dir: string) {
    let results: string[] = []
    fs.readdirSync(dir).forEach((item: string) => {

      item = path.join(dir, item)

      // 排除文件夹
      const excludeList = Array.isArray(this.config.exclude) ? this.config.exclude.map(i => path.join(this.rootPath, i)) : []

      if (excludeList.includes(dir)) return

      if (fs.lstatSync(item).isDirectory()) {
        results.push(...this.getAllFiles(item))
      } else {
        if (
          this.config.extensions.indexOf(path.extname(item).toLowerCase()) > -1
        ) {
          results.push(item)
        }
      }
    })

    return results
  }
}


export const VueI18nInstance = new VueI18n()
