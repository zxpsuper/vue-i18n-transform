export type Config = {
    single: boolean;
    filename: string;
    entry: string;
    outdir: string;
    exclude: string[];
    extensions: string[];
    useChineseKey: boolean;
};
export default class VueI18n {
    /** */
    private index;
    /**中文 key 哈希字典 */
    private messagesHash;
    /**i18n 输出的字典{ key: '值' } */
    private messages;
    /**入口完整路径 */
    private rootPath;
    /**默认配置 */
    private config;
    static defaultConfig: Config;
    /**获取项目配置 */
    getConfig(): Config;
    setMessage(messages: Record<string, string>): void;
    getMessage(): Record<string, string>;
    /**根据 message 初始化 index */
    initIndex(): void;
    /**
     * 合并配置
     * @param config
     */
    mergeConfig(config: Config): void;
    setMessageItem(key: string, value: string): void;
    setMessagesHashItem(key: string, value: string): void;
    /**
     * 获取 message 的 key， 如果没有则新建一个
     * @param chinese
     * @param file
     * @returns
     */
    getCurrentKey(chinese: string, file: string): string;
    /**删除 message 中的键值 */
    deleteMessageKey(key: string): void;
    getPreKey(file: string): string;
    /**获取所有文件路径 */
    getAllFiles(dir: string): string[];
}
export declare const VueI18nInstance: VueI18n;
