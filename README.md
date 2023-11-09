# vue-i18n-transform

一款 vue-i18n 转化插件，可以与 npm 插件 （[vue-i18n-transform](https://github.com/zxpsuper/vue-i18n-transform)）同时使用。

![](https://github.com/zxpsuper/vue-i18n-transform/blob/vscode-plugin/GIF.gif?raw=true)

**vue 文件替换**

```html
<!-- 替换前 -->
<i :class="{ selected: tabactiveName === 1 }" @click="handleTabClick(1)">
  <span>效果图</span>
</i>

<!-- 替换后 -->
<i :class="{ selected: tabactiveName === 1 }" @click="handleTabClick(1)">
  <span>{{$t('filename_1')}}</span>
</i>
```

**js / ts 文件替换**

```js
// 替换前
export const map = {
  key: '替换前'
}

// 替换后

import i18n from '../locales/index.js'

export const map = {
  key: i18n.t('filename_2')
}
```

**生成 locales/zh_cn.json 文件**

```json
{
  "filename_1": "效果图",
  "filename_2": "替换前"
}
```

**生成 locales/index.js 文件**

```js
import VueI18n from 'vue-i18n'
import Vue from 'vue'
import zh from './zh_cn.json'

Vue.use(VueI18n)

export default new VueI18n({
  locale: 'zh',
  messages: {
    zh
  }
})
```

**需手动将 VueI18n 导入入口文件中使用**

```js
import i18n from './locales/index.js'

new Vue({
  i18n,
  router,
  store
})
```
## 功能

- 提供文本提示功能

- 提供单文件转化功能，多文件转化请用 npm 插件实现, [github 地址](https://github.com/zxpsuper/vue-i18n-transform)

- 支持 vue， js， ts 文件

## 配置

以下是默认配置, 当然你也可以在项目文件夹下创建 `vue-i18n-transform.config.js` 文件, 按下面的配置修改你的自定义配置

```js
module.exports = {
  entry: 'src', // 编译入口文件夹,默认是 src
  outdir: 'src/locales', // i18n 输出文件夹 默认是 src/locales
  exclude: ['src/locales'], // 不重写的文件夹, 默认是 ['src/locales']
  extensions: ['.vue', '.js', '.ts'], // 重写的文件类型，默认是 ['.js', '.vue', '.ts']
  single: false, // 是否为单文件编译, 默认为 false. 如果为 true, 则 entry 需为文件而不是文件夹, 如 entry: 'src/index.vue'
  filename: 'zh_cn', // 输入的中文 json 文件名,默认为 zh_cn
  useChineseKey: false // 是否使用中文作为key值，默认为false
}
```

## 问题&建议

如果你有任何问题，可以给我发邮件(zxpscau@163.com)，或者给项目提 [issue](https://github.com/zxpsuper/vue-i18n-transform/issues/new).