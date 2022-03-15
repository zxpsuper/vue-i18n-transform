"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VueI18nInstance = void 0;
var path = require('path');
var fs = require('fs-extra');
var VueI18n = /** @class */ (function () {
    function VueI18n() {
        /** */
        this.index = 1;
        /**中文 key 哈希字典 */
        this.messagesHash = {};
        /**i18n 输出的字典{ key: '值' } */
        this.messages = {};
        /**入口完整路径 */
        this.entryPath = '';
        this.rootPath = '';
        /**默认配置 */
        this.config = {
            single: false,
            filename: 'zh_cn',
            entry: 'src',
            outdir: 'src/locales',
            exclude: ['src/locales'],
            extensions: ['.js', '.vue', '.ts']
        };
    }
    /**获取项目配置 */
    VueI18n.prototype.getConfig = function () {
        return this.config;
    };
    VueI18n.prototype.setMessage = function (messages) {
        var _this = this;
        this.messages = messages;
        Object.keys(messages).forEach(function (key) {
            _this.messagesHash[messages[key]] = key;
        });
    };
    VueI18n.prototype.getMessage = function () {
        return this.messages;
    };
    /**根据 message 初始化 index */
    VueI18n.prototype.initIndex = function () {
        this.index = Math.max.apply(Math, __spreadArray([1,
            1], Object.keys(this.messages).map(function (item) {
            return Number(item.replace(/^[^\d]+/, '')) || 0;
        }), false));
    };
    /**
     * 合并配置
     * @param config 配置
     * @param root 项目根路径
     */
    VueI18n.prototype.mergeConfig = function (config, root) {
        this.config = Object.assign(this.config, config);
        this.rootPath = path.join(root);
        this.entryPath = path.join(root, this.config.entry);
    };
    VueI18n.prototype.setMessageItem = function (key, value) {
        this.messages[key] = value;
    };
    VueI18n.prototype.setMessagesHashItem = function (key, value) {
        this.messagesHash[key] = value;
    };
    /**
     * 获取 message 的 key， 如果没有则新建一个
     * @param chinese
     * @param file
     * @returns
     */
    VueI18n.prototype.getCurrentKey = function (chinese, file) {
        if (this.messagesHash[chinese])
            return this.messagesHash[chinese];
        var key = this.getPreKey(file) + this.index;
        this.index = this.index + 1;
        if (this.messages && !this.messages[key])
            return key.toLowerCase();
        return this.getCurrentKey(chinese, file);
    };
    /**
     * 删除 message 中的键值
     * @param key
     */
    VueI18n.prototype.deleteMessageKey = function (key) {
        delete this.messages[key];
    };
    /**
     * 获取当前文件专属 key 前缀
     * @param file
     * @returns
     */
    VueI18n.prototype.getPreKey = function (file) {
        return "".concat(path
            .relative(this.entryPath, file)
            .replace(/[\\/\\\\-]/g, '_')
            .replace(/\..*$/, ''), "_");
    };
    /**
     * 获取当前文件夹下所有文件完整路径
     * @param dir 当前文件夹
     * @returns
     */
    VueI18n.prototype.getAllFiles = function (dir) {
        var _this = this;
        var results = [];
        fs.readdirSync(dir).forEach(function (item) {
            item = path.join(dir, item);
            // 排除文件夹
            var excludeList = Array.isArray(_this.config.exclude) ? _this.config.exclude.map(function (i) { return path.join(_this.rootPath, i); }) : [];
            if (excludeList.includes(dir))
                return;
            if (fs.lstatSync(item).isDirectory()) {
                results.push.apply(results, _this.getAllFiles(item));
            }
            else {
                if (_this.config.extensions.indexOf(path.extname(item).toLowerCase()) > -1) {
                    results.push(item);
                }
            }
        });
        return results;
    };
    return VueI18n;
}());
exports.default = VueI18n;
exports.VueI18nInstance = new VueI18n();
