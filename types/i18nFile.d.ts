export declare type Config = {
    single: boolean;
    filename: string;
    entry: string;
    outdir: string;
    exclude: string[];
    extensions: string[];
};
export default class VueI18n {
    /** */
    private index;
    /**中文 key 哈希字典 */
    private messagesHash;
    /**i18n 输出的字典{ key: '值' } */
    private messages;
    /**入口完整路径 */
    private entryPath;
    private rootPath;
    /**默认配置 */
    private config;
    /**获取项目配置 */
    getConfig(): Config;
    setMessage(messages: Record<string, string>): void;
    getMessage(): Record<string, string>;
    /**根据 message 初始化 index */
    initIndex(): void;
    /**
     * 合并配置
     * @param config 配置
     * @param root 项目根路径
     */
    mergeConfig(config: Config, root: string): void;
    setMessageItem(key: string, value: string): void;
    setMessagesHashItem(key: string, value: string): void;
    /**
     * 获取 message 的 key， 如果没有则新建一个
     * @param chinese
     * @param file
     * @returns
     */
    getCurrentKey(chinese: string, file: string): string;
    /**
     * 删除 message 中的键值
     * @param key
     */
    deleteMessageKey(key: string): void;
    /**
     * 获取当前文件专属 key 前缀
     * @param file
     * @returns
     */
    getPreKey(file: string): string;
    /**
     * 获取当前文件夹下所有文件完整路径
     * @param dir 当前文件夹
     * @returns
     */
    getAllFiles(dir: string): string[];
}
export declare const VueI18nInstance: VueI18n;
