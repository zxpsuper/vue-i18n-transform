## v0.0.6

- fix: js/ts文件 require 导入图片含中文时不自动转化
- fix: 模板中 src 中 require 图片路径不需要转化
- fix: 模板中的中文注释也不自动转化
- fix: js 文件 require 中文图片不需转化
- fix: vue 的 js 模块不要用 this，容易出问题
- fix: 模板中 src 中 require 图片路径不需要转化
- fix: js 中排除对 console.log 的翻译

- feat: 支持使用中文做键值
- feat: vue js 部分不用 this.$t('key'), 改用 i18n.t('key')