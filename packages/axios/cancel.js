import {generateReqKey} from "./utils.js";

const instance = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
});
const pendingRequest = new Map();

function addPendingRequest(config) {
    const requestKey = generateReqKey(config);
    config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
        if (!pendingRequest.has(requestKey)) {
            pendingRequest.set(requestKey, cancel);
            console.log("addPendingRequest", pendingRequest, requestKey, config.cancelToken);
        }
    });
}

function removePendingRequest(config) {
    const requestKey = generateReqKey(config);
    if (pendingRequest.has(requestKey)) {
        const cancelToken = pendingRequest.get(requestKey);
        cancelToken(requestKey);
        pendingRequest.delete(requestKey);
    }
}

instance.interceptors.request.use(
    function (config) {
        removePendingRequest(config); // check if request is already exist
        addPendingRequest(config); // add current request to pendingRequest
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        removePendingRequest(response.config); // remove request from pendingRequest
        return response;
    },
    (error) => {
        removePendingRequest(error.config || {}); // remove request from pendingRequest
        if (axios.isCancel(error)) {
            console.log("已取消的：" + error.message);
        } else {
            // 添加异常处理
        }
        return Promise.reject(error);

    });

async function sendRequest() {
    // low netwok speed could see cancel more clearly
    const response = await instance.get("/todos/1");
    console.dir(response);
}

document.querySelector("#cancel").addEventListener("click", sendRequest);
