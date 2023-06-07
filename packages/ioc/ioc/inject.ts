import 'reflect-metadata';

export const PROPS_KEY = 'ioc:inject_props';

export function Inject() {
    return function (target: any, targetKey: string) {
        /*
        *  on instance property, the target will be the prototype of the class,
        *  not the constructor. So, we need to use target.constructor to pointer
        *  to the class(or function itself)
        * */
        const annotationTarget = target.constructor;

        //
        let props = {} as any;
        if (Reflect.hasOwnMetadata(PROPS_KEY, annotationTarget)) {
            props = Reflect.getMetadata(PROPS_KEY, annotationTarget);
        }
        props[targetKey] = {
            value: targetKey
        };

        Reflect.defineMetadata(PROPS_KEY, props, annotationTarget);
    };
}



// https://stackoverflow.com/questions/42281045/can-typescript-property-decorators-set-metadata-for-the-class