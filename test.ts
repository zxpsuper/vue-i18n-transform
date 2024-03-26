import recoverJavaScript from './src/core/recoverJavaScript'
import VueI18n from './src/core/i18nFile'
const VueI18nInstance = new VueI18n()

const content = `const image = i18n.t('test_1', [this.age])`
VueI18nInstance.setMessageItem('test_1', '美女{0}帅哥')
const result = recoverJavaScript(content, VueI18nInstance)

console.log(result === 'const image = `美女${this.age}帅哥`', result)


const content2 = `const image = i18n.t('test_2', [this.age, name])`
VueI18nInstance.setMessageItem('test_2', '{0}美女{1}')
const result2 = recoverJavaScript(content2, VueI18nInstance)

console.log(result2 === 'const image = `${this.age}美女${name}`', result2)