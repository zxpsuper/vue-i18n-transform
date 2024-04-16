# Change Log

## v0.0.8 2024/04/16

- fix: 修复编辑器重启后recover失效问题

## v0.0.7 2024/03/26

- fix: js/ts文件 require 导入图片含中文时不自动转化
- fix: 模板中 src 中 require 图片路径不需要转化
- fix: 模板中的中文注释也不自动转化
- fix: js 文件 require 中文图片不需转化
- fix: vue 的 js 模块不要用 this，容易出问题
- fix: 模板中 src 中 require 图片路径不需要转化
- fix: js 中排除对 console.log 的翻译

- feat: 支持使用中文做键值
- feat: vue js 部分不用 this.$t('key'), 改用 i18n.t('key')


## v0.0.6 2023/12/14

- 修复中文键可以被多次转换缺陷

## v0.0.5 2023/11/09

- 新增支持 recoverI18n 一键恢复多语言变量
- 新增支持使用中文键作为 json 包 key 值
- 语言包优化，删除无法使用的键值对


## v0.0.4 long time age

- 支持 transformI18n 一键转化
- 支持鼠标悬浮预览多语言变量文本
- 支持一键跳转语言包位置