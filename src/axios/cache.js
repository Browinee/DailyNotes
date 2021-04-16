import {cacheAdapterEnhancer} from "./utils.js";


const instance = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    adapter: cacheAdapterEnhancer(axios.defaults.adapter, {
        enabledByDefault: false,
        maxAge: 5000,
    }),
});
async function requestWithCache() {
    const response = await instance.get("/todos/1", {cache: true});
    console.dir(response);
}

async function requestWithoutCache() {
    const response = await instance.get("/todos/1", {cache: false});
    console.dir(response);
}

document.querySelector("#withCache").addEventListener("click", requestWithCache);
document.querySelector("#withoutCache").addEventListener("click", requestWithoutCache);



