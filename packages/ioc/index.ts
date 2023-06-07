import {Container} from "./ioc/container";
import {load} from "./ioc/load";

const container = new Container();
load(container);

// console.log("container", container.get('a'));  // => A { b: B { p: 10 } }
// https://juejin.cn/post/6898882861277904910#heading-8