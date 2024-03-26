import { recoverJavaScriptFile, recoverVueScript } from '../src/core/recover';
import VueI18n from '../src/core/i18nFile'


describe('recoverJavaScriptFile 测试', () => {
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
  })
  it('import去除', () => {
    const content = `import i18n from '../../scr/index'\nconst name = i18n.t('test_1')`
    VueI18nInstance.setMessageItem('test_1', '美女')
    const result = recoverJavaScriptFile(content, VueI18nInstance)
    expect(result).toBe(`const name = '美女'`)
  })

  it('require去除', () => {
    const content = `const i18n = require('../../scr/index')\nconst name = i18n.t('test_1')`
    VueI18nInstance.setMessageItem('test_1', '美女')
    const result = recoverJavaScriptFile(content, VueI18nInstance)
    expect(result).toBe(`const name = '美女'`)
  })
})


describe('recoverVueScript 测试', () => {
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
  })
  it('import去除', () => {
    const content = `<script>\nimport i18n from '../../scr/index'\nconst name = i18n.t('test_1')\n</script>`
    VueI18nInstance.setMessageItem('test_1', '美女')
    const result = recoverVueScript(content, VueI18nInstance)
    expect(result).toBe(`<script>\nconst name = '美女'\n</script>`)
  })

  it('import去除（script带属性）', () => {
    const content = `<script lang="ts">\nimport i18n from '../../scr/index'\nconst name = i18n.t('test_1')\n</script>`
    VueI18nInstance.setMessageItem('test_1', '美女')
    const result = recoverVueScript(content, VueI18nInstance)
    expect(result).toBe(`<script lang="ts">\nconst name = '美女'\n</script>`)
  })

  it('require去除', () => {
    const content = `<script>const i18n = require('../../scr/index')\nconst name = i18n.t('test_1')\n</script>`
    VueI18nInstance.setMessageItem('test_1', '美女')
    const result = recoverVueScript(content, VueI18nInstance)
    expect(result).toBe(`<script>const name = '美女'\n</script>`)
  })
})