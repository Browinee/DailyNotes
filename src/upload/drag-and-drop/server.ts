import path from "path";
import Koa from "koa";
import cors from "@koa/cors";
import serve from "koa-static";
import multer from "@koa/multer";
import Router from "@koa/router"

const app = new Koa();
const router = new Router();
const PORT = 3000;
const RESOURCE_URL = `http://localhost:${PORT}`;
const UPLOAD_DIR = path.join(__dirname, "/public/upload");

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    },
});

const multerUpload = multer({ storage });

router.get("/", async (ctx) => {
    ctx.body = "Drag and Drop service!";
});
router.post(
    "/upload/multiple",
    async (ctx, next) => {
        try {
            await next();
            const urls = ctx.files.file.map(file => `${RESOURCE_URL}/${file.originalname}`);
            ctx.body = {
                code: 1,
                msg: "文件上傳成功",
                urls
            };
        } catch (error) {
            ctx.body = {
                code: 0,
                msg: "文件上傳失敗",
            };
        }
    },
    multerUpload.fields([
        {
            name: "file",
        },
    ])
);

router.post(
    "/upload/single",
    async (ctx, next) => {
        try {
            await next();
            ctx.body = {
                code: 1,
                msg: "文件上傳成功",
                url: `${RESOURCE_URL}/${ctx.file.originalname}`,
            };
        } catch (error) {
            console.dir(error);
            ctx.body = {
                code: 0,
                msg: "文件上傳失敗",
            };
        }
    },
    multerUpload.single("file")
);

app.use(cors());
app.use(serve(UPLOAD_DIR));
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
    console.log(`server start on ：http://localhost:${PORT}/`);
});
