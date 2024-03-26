import recoverJavaScript from '../src/core/recoverJavaScript'
import VueI18n from '../src/core/i18nFile'


describe('recoverJavaScript 测试', () => {
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
  })
  it('中文还原(单引号)', () => {
    const content = `const name = i18n.t('test_1')`
    VueI18nInstance.setMessageItem('test_1', '你好')
    const result = recoverJavaScript(
      content,
      VueI18nInstance,
    )
    expect(result).toBe(
      `const name = '你好'`
    )
  })
  it('中文还原(双引号)', () => {
    const content = `const name = i18n.t("test_1")`
    VueI18nInstance.setMessageItem('test_1', '你好')
    const result = recoverJavaScript(
      content,
      VueI18nInstance,
    )
    expect(result).toBe(
      `const name = '你好'`
    )
  })

  it('this,that还原', () => {
    const content = `const name = this.$t('test_1')`
    const content2 = `const name = that.$t('test_1')`
    VueI18nInstance.setMessageItem('test_1', '你好')
    const result = recoverJavaScript(
      content,
      VueI18nInstance,
    )
    const result2 = recoverJavaScript(
      content2,
      VueI18nInstance,
    )
    expect(result).toBe(
      `const name = '你好'`
    )
    expect(result2).toBe(
      `const name = '你好'`
    )
  })

  it('拼接字符串还原', () => {
    const content = `const image = i18n.t('test_1', [this.age])`
    VueI18nInstance.setMessageItem('test_1', '美女{0}帅哥')
    const result = recoverJavaScript(
      content,
      VueI18nInstance,
    )
    expect(result).toBe(
      'const image = `美女${this.age}帅哥`'
    )
  })

  it('拼接字符串多变量还原', () => {
    const content = `const image = i18n.t('test_1', [age, name])`
    VueI18nInstance.setMessageItem('test_1', '{0}美女{1}')
    const result = recoverJavaScript(
      content,
      VueI18nInstance,
    )
    expect(result).toBe(
      'const image = `${age}美女${name}`'
    )
  })
})