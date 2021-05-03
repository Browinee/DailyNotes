import {Inject} from "../ioc/inject";
import {Provider} from "../ioc/provider";
import {B} from "./b";

@Provider('a')
export class A {
    @Inject()
    private b:B;

}