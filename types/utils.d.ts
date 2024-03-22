import { Config } from './core/i18nFile';
export declare function errorlog(message: string): void;
export declare function successlog(message: string): void;
export declare function warnlog(message: string): void;
/**写入 i18n index 文件  */
export declare function writeIndexFile(i18nDir: string, config: Config): void;
