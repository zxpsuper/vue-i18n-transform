import { Config, VueI18nInstance } from './core/i18nFile'
const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')

type ReplaceProps = {
  content: string
  file: string
  getKey: (match: string, file: string) => string
  replaceSuccess?: (data: { currentKey: string; match: string }) => void
  replaceFail?: (data: { currentKey: string; match: string }) => void
}

export function errorlog(message: string) {
  console.error(chalk.red('✖ ' + message))
}

export function successlog(message: string) {
  console.error(chalk.green('✔ ' + message))
}

export function warnlog(message: string) {
  console.error(chalk.yellow('⚠ ' + message))
}


/**写入 i18n index 文件  */
export function writeIndexFile(i18nDir: string, config: Config) {
  const exist = fs.existsSync(i18nDir)
  if (!exist) {
    errorlog(`文件夹${i18nDir}不存在`)
    successlog(`自动为你创建文件夹${i18nDir}`)
    fs.mkdirSync(i18nDir)
  }
  const file = path.join(i18nDir, `index.js`)
  if (fs.existsSync(file)) return
  fs.writeFileSync(
    file,
    `import VueI18n from 'vue-i18n'\nimport Vue from 'vue'\nimport zh from './${config.filename}.json'\n\n` +
    `Vue.use(VueI18n)\n\nexport default new VueI18n({\n\tlocale: 'zh',\n\tmessages: {\n\t\tzh \n\t}\n})\n`,
    'utf8'
  )
}