import { replaceJavaScriptFile, replaceVueScript } from '../src/core/transform';
import VueI18n from '../src/core/i18nFile'
import _const from '../src/core/const'
const path = require('path')

const configFile = _const.CustomSettingFileName + '.js'

const message = {
  error: () => { },
  warn: () => { }
}


describe('transform 测试', () => {
  const configPath = path.join(process.cwd(), configFile)
  const config = require(configPath)
  config.entry = 'testExample/origin'
  config.out = 'testExample/out'
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({ ...config, projectDirname: process.cwd() })
  })

  it('vue中js自动导入i18n', () => {
    const content = `<script lang="ts">const name = '哈哈'</script>`
    const result = replaceVueScript(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `<script lang="ts">\nimport i18n from '../out/index'\nconst name = i18n.t('test_1')</script>`
    )
  })

  it('vue中js不重复导入i18n', () => {
    const content = `<script lang="ts">\nimport i18n from '../out/index'\nconst name = '哈哈'</script>`
    const result = replaceVueScript(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `<script lang="ts">\nimport i18n from '../out/index'\nconst name = i18n.t('test_1')</script>`
    )
  })

  it('vue中js自动导入i18n(转化文件层级在i18n上级)', () => {
    const content = `<script lang="ts">const name = '哈哈'</script>`
    const result = replaceVueScript(
      content,
      'testExample/test.vue',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `<script lang="ts">\nimport i18n from './out/index'\nconst name = i18n.t('test_1')</script>`
    )
  })

  it('测试js自动导入i18n(转化文件层级在i18n上级)', () => {
    const content = `const name = '哈哈'`
    const result = replaceJavaScriptFile(
      content,
      'testExample/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `import i18n from './out/index'\nconst name = i18n.t('test_1')`
    )
  })

  it('测试js自动导入i18n', () => {
    const content = `const name = '哈哈'`
    const result = replaceJavaScriptFile(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `import i18n from '../out/index'\nconst name = i18n.t('test_1')`
    )
  })

  it('测试js不重复导入i18n', () => {
    const content = `import i18n from '../out/index'\nconst name = '哈哈'`
    const result = replaceJavaScriptFile(
      content,
      'testExample/origin/test.js',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `import i18n from '../out/index'\nconst name = i18n.t('test_1')`
    )
  })
})