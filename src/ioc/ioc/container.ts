import { PROPS_KEY } from './inject';

export class Container {
    bindMap = new Map();

    bind(identifier: string, clazz: any, constructorArgs?: Array<any>) {
        this.bindMap.set(identifier, {
            clazz,
            constructorArgs: constructorArgs || []
        });
    }

    get<T>(identifier: string): T {
        const target = this.bindMap.get(identifier);
        const { clazz, constructorArgs } = target;
        console.log("target---targrt", Reflect.getMetadataKeys(clazz));
        const props = Reflect.getMetadata(PROPS_KEY, clazz);
        const inst = Reflect.construct(clazz, constructorArgs);

        for (let prop in props) {
            const identifier = props[prop].value;
            inst[ prop ] = this.get(identifier);
        }
        return inst;
    }
}

