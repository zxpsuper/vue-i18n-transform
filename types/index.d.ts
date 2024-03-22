#!/usr/bin/env node
import { errorlog, successlog } from './utils';
export declare const message: {
    error: typeof errorlog;
    successlog: typeof successlog;
};
