"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomSetting = void 0;
var const_1 = require("./const");
var path = require('path');
var fs = require('fs');
var validator = require('validator');
/**
 * 获取用户设置 vue-i18n-transform.config.js / vue-i18n-transform.config.json
 * @param fsPath
 * @param customConfigFileName
 * @param forceIgnoreCustomSetting
 * @returns
 */
function getCustomSetting(fsPath, customConfigFileName, VueI18nInstance, msg, forceIgnoreCustomSetting) {
    if (forceIgnoreCustomSetting === void 0) { forceIgnoreCustomSetting = false; }
    var dirName = path.dirname(fsPath);
    var root = path.parse(dirName).root;
    if (root === dirName) {
        return VueI18nInstance.getConfig();
    }
    else if (fs.existsSync(path.join(dirName, const_1.default.pkgFileName))) {
        var customPath = path.join(dirName, customConfigFileName + '.js');
        var customJSONPath = path.join(dirName, customConfigFileName + '.json');
        var fileExist = fs.existsSync(customPath) || fs.existsSync(customJSONPath);
        var data = fileExist && !forceIgnoreCustomSetting ? fs.readFileSync(customPath) : '';
        if (data === '') {
            return VueI18nInstance.getConfig();
        }
        var customSetting = validator.isJSON(data.toString())
            ? JSON.parse(data.toString())
            : eval(data.toString());
        if (fileExist &&
            !forceIgnoreCustomSetting &&
            fs.existsSync(customJSONPath) &&
            !validator.isJSON(data.toString())) {
            (msg === null || msg === void 0 ? void 0 : msg.error) && msg.error('json 配置文件格式错误');
            return {};
        }
        else {
            return __assign({ projectDirname: dirName }, customSetting);
        }
    }
    else {
        return getCustomSetting(dirName, customConfigFileName, VueI18nInstance, msg, forceIgnoreCustomSetting);
    }
}
exports.getCustomSetting = getCustomSetting;
