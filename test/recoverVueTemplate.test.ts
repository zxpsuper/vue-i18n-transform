import recoverVueTemplate from '../src/core/recoverVueTemplate'
import VueI18n from '../src/core/i18nFile'

describe('recoverVueTemplate 测试', () => {
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
  })
  it('普通标签中文还原(单引号)', () => {
    const content = `<template>
      <span>{{$t('test_1')}}</span>
    </template>`
    VueI18nInstance.setMessageItem('test_1', '你好')
    const result = recoverVueTemplate(
      content,
      VueI18nInstance,
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><span>你好</span></template>`
    )
  })

  it('普通标签中文还原(双引号)', () => {
    const content = `<template>
      <span>{{$t("test_1")}}</span>
    </template>`
    VueI18nInstance.setMessageItem('test_1', '你好')
    const result = recoverVueTemplate(
      content,
      VueI18nInstance,
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><span>你好</span></template>`
    )
  })

  it('带变量中文还原(单引号)', () => {
    const content = `<template>
      <span>{{$t('test_1', [name])}}</span>
    </template>`
    VueI18nInstance.setMessageItem('test_1', '你好{0}')
    const result = recoverVueTemplate(
      content,
      VueI18nInstance,
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><span>你好{{name}}</span></template>`
    )
  })
  it('带变量中文还原(双引号)', () => {
    const content = `<template>
      <span>{{$t("test_1", [name])}}</span>
    </template>`
    VueI18nInstance.setMessageItem('test_1', '你好{0}')
    const result = recoverVueTemplate(
      content,
      VueI18nInstance,
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><span>你好{{name}}</span></template>`
    )
  })
  it('多变量中文还原', () => {
    const content = `<template>
      <span>{{$t('test_1', [name, age])}}</span>
    </template>`
    VueI18nInstance.setMessageItem('test_1', '{0}你好{1}')
    const result = recoverVueTemplate(
      content,
      VueI18nInstance,
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><span>{{name}}你好{{age}}</span></template>`
    )
  })

  it('标签属性中文+变量还原', () => {
    const content = `<template><div :name="$t('test_1') + name"></div></template>`
    VueI18nInstance.setMessageItem('test_1', '你好')
    const result = recoverVueTemplate(
      content,
      VueI18nInstance,
    )
    expect(result).toBe(
      `<template><div :name="'你好' + name"></div></template>`
    )
  })
})