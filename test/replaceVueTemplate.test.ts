import replaceVueTemplate from '../src/core/replaceVueTemplate'
import VueI18n from '../src/core/i18nFile'
import _const from '../src/core/const'
const path = require('path')

const configFile = _const.CustomSettingFileName + '.js'

const message = {
  error: () => { },
  warn: () => { }
}

describe('replaceVueTemplate 测试', () => {
  const configPath = path.join(process.cwd(), configFile)
  const config = require(configPath)
  config.entry = 'testExample/origin'
  let VueI18nInstance: VueI18n
  beforeEach(() => {
    VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({ ...config, projectDirname: process.cwd() })
  })
  it('普通标签中文替换', () => {
    const content = `<template>
      <span>中文替换</span>
    </template>`
    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><span>{{$t('test_1')}}</span></template>`
    )
  })

  it('不替换html注释', () => {
    const content = `<template>\n<!--<span>中文替换</span>-->\n<div>测试</div>\n</template>`
    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `<template>\n<!--<span>中文替换</span>-->\n<div>{{$t('test_1')}}</div>\n</template>`
    )
  })

  it('不替换html注释', () => {
    const content = `<template>\n<!--http://baidu.com 真好-->\n<div>测试</div>\n</template>`
    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result).toBe(
      `<template>\n<!--http://baidu.com 真好-->\n<div>{{$t('test_1')}}</div>\n</template>`
    )
  })

  it('不替换html注释(后接中文)', () => {
    const content = `<template>
                      撒旦法发
                      <!--<span>中文替换</span>-->
                      <div>测试</div>
                      <!--<span>中文替换</span>-->
                      是的罚款
                    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template>{{$t('test_1')}}<!--<span>中文替换</span>--><div>{{$t('test_2')}}</div><!--<span>中文替换</span>-->{{$t('test_3')}}</template>`
    )
  })

  it('不替换require文件中的中文', () => {
    const content = `<template>
      <img :src="require('@/assets/中文.png')"/>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><img:src="require('@/assets/中文.png')"/></template>`
    )
  })

  it('不替换$t()中的中文', () => {
    const content = `<template>
      <div>{{$t("测试")}}</div>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/\n\r|\s+/gim, '')).toBe(
      `<template><div>{{$t("测试")}}</div></template>`
    )
  })

  it('不替换src属性的中文', () => {
    const content = `<template>
      <img src="@/assets/中文.png"/>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><img src="@/assets/中文.png"/></template>`
    )
  })

  it('替换变量+中文，{{name}}名字', () => {
    const content = `<template>
      <div>{{name}}名字</div>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div>{{$t("test_1", [name])}}</div></template>`
    )
    expect(VueI18nInstance.getMessage().test_1).toBe(`{0}名字`)
  })

  it('替换中文+变量，名字{{name}}', () => {
    const content = `<template>
      <div>名字{{name}}</div>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div>{{$t("test_1", [name])}}</div></template>`
    )
    expect(VueI18nInstance.getMessage().test_1).toBe(`名字{0}`)
  })

  it('替换中文+变量+中文，名字{{name}}年龄', () => {
    const content = `<template>
      <div>名字{{name}}年龄</div>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div>{{$t("test_1", [name])}}</div></template>`
    )
    expect(VueI18nInstance.getMessage().test_1).toBe(`名字{0}年龄`)
  })

  it('替换标签属性的中文', () => {
    const content = `<template>
      <div name="中文"></div>
    </template>`

    const result = replaceVueTemplate(
      content,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div :name="$t('test_1')"></div></template>`
    )
    // 处理带-的属性
    const content2 = `<template>
      <div data-name="中文"></div>
      <div data-data-name="中文"></div>
    </template>`
    const result2 = replaceVueTemplate(
      content2,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result2.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div :data-name="$t('test_1')"></div><div :data-data-name="$t('test_1')"></div></template>`
    )

    const content3 = `<template>
      <div :name="'中文'"></div>
      <div :data-data-name="'中文'"></div>
    </template>`

    const result3 = replaceVueTemplate(
      content3,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result3.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div :name="$t('test_1')"></div><div :data-data-name="$t('test_1')"></div></template>`
    )
    // 处理不合理单引号写法 :name='"中文"'
    const content4 = `<template>
      <div :name='"中文"'></div>
    </template>`
    const result4 = replaceVueTemplate(
      content4,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result4.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div :name='$t("test_1")'></div></template>`
    )
    // 处理不合理单引号写法 name='中文'
    const content5 = `<template>
      <div name='中文'></div>
    </template>`
    const result5 = replaceVueTemplate(
      content5,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result5.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div :name='$t("test_1")'></div></template>`
    )
    // 对于属性中参数形式中的替换
    const content6 = `<template>
      <div :name="'英文' + test + '中文'"></div>
    </template>`
    const result6 = replaceVueTemplate(
      content6,
      'testExample/origin/test.vue',
      VueI18nInstance,
      message
    )
    expect(result6.replace(/[\n\r]+|\s{2,}/gim, '')).toBe(
      `<template><div :name="$t('test_2') + test + $t('test_1')"></div></template>`
    )
  })

  // 这种情况测试不通过
  it('替换中文+变量(含中文)，名字{{name + "英文"}}', () => {
    const VueI18nInstance = new VueI18n()
    VueI18nInstance.mergeConfig({...config, projectDirname: process.cwd()})
    const content = `<template><div>名字{{name + "英文"}}</div></template>`
    const result = replaceVueTemplate(content, 'testExample/origin/test.vue', VueI18nInstance, message)
    expect(result).toBe(`<template><div>名字{{name +"英文"}}</div></template>`)
  })
})
