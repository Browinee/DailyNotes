import {Provider} from "./ioc/provider";

@Provider('b', [10])
export class B {
    p: number;
    constructor(p: number) {
        this.p = p;
    }
}