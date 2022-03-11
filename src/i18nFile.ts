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
        Number(item.replace(/^[^\d]+/, ''))
      )
    )
  }

  /**
   * 合并配置
   * @param config
   */
  mergeConfig(config: Config) {
    this.config = Object.assign(this.config, config)
    this.rootPath = path.join(process.cwd(), this.config.entry)
  }

  setMessageItem(key: string, value: string) {
    this.messages[key] = value
  }

  setMessagesHashItem(key: string, value: string) {
    this.messagesHash[key] = value
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

  /**删除 message 中的键值 */
  deleteMessageKey(key: string) {
    delete this.messages[key]
  }

  getPreKey(file: string) {
    return `${path
      .relative(this.rootPath, file)
      .replace(/[\\/\\\\-]/g, '_')
      .replace(/\..*$/, '')}_`
  }

  /**获取所有文件路径 */
  getAllFiles(dir: string) {
    let results: string[] = []
    fs.readdirSync(dir).forEach((item: string) => {
      item = path.join(dir, item)
      // 排除文件夹
      if (this.config.exclude.includes(dir.replace('\\', '/'))) return
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
