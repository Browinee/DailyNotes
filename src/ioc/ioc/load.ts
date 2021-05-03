import * as fs from 'fs';
import { CLASS_KEY } from './provider';

export function load(container: any) {
    const list = fs.readdirSync('./service');
    for (const file of list) {
        if (/\.ts$/.test(file)) {
            const exports = require(`../service/${file}`);
            for (const m in exports) {
                const module = exports[m];
                if (typeof module === 'function') {
                    const metadata = Reflect.getMetadata(CLASS_KEY, module);
                    if (metadata) {
                        container.bind(metadata.id, module, metadata.args)
                    }
                }
            }
        }
    }
}

