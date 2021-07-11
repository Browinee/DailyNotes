import fs from "fs";
import path from "path";
import util from "util";
import Koa from "koa"
import cors from "@koa/cors"
import multer from "@koa/multer"
import Router from "@koa/router"
import serve from "koa-static"
import fse from "fs-extra";

const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);

const app = new Koa();
const router = new Router();
const TMP_DIR = path.join(__dirname, "tmp"); // temporary directory
const UPLOAD_DIR = path.join(__dirname, "/public/upload");
const IGNORES = [".DS_Store"]; // ignored file direction

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        let fileMd5 = file.originalname.split("-")[0];
        const fileDir = path.join(TMP_DIR, fileMd5);
        await fse.ensureDir(fileDir);
        cb(null, fileDir);
    },
    filename: function (req, file, cb) {
        let chunkIndex = file.originalname.split("-")[1];
        cb(null, `${chunkIndex}`);
    },
});

const multerUpload = multer({storage});

router.get("/", async (ctx) => {
    ctx.body = "Big file upload example.";
});

router.get("/upload/exists", async (ctx) => {
    const {name: fileName, md5: fileMd5} = ctx.query;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const isExists = await fse.pathExists(filePath);
    console.log("filePath", filePath);
    if (isExists) {
        ctx.body = {
            status: "success",
            data: {
                isExists: true,
                url: `http://localhost:3003/${fileName}`,
            },
        };
    } else {
        ctx.body = {
            status: "success",
            data: {
                isExists: false,
            },
        };
    }
});

router.post(
    "/upload/single",
    multerUpload.single("file"),
    async (ctx, next) => {
        ctx.body = {
            code: 1,
            data: ctx.file,
        };
    }
);

router.get("/upload/concatFiles", async (ctx) => {
    const {name: fileName, md5: fileMd5} = ctx.query;
    await concatFiles(
        path.join(TMP_DIR, fileMd5),
        path.join(UPLOAD_DIR, fileName)
    );
    ctx.body = {
        status: "success",
        data: {
            url: `http://localhost:3003/${fileName}`,
        },
    };
});

async function concatFiles(sourceDir, targetPath) {
    const readFile = (file, ws) =>
        new Promise((resolve, reject) => {
            fs.createReadStream(file)
                .on("data", (data) => ws.write(data))
                .on("end", resolve)
                .on("error", reject);
        });
    const files = await readdir(sourceDir);
    const sortedFiles = files
        .filter((file) => {
            return IGNORES.indexOf(file) === -1;
        })
        .sort((a:string, b:string) => (+a) - (+b));
    const writeStream = fs.createWriteStream(targetPath);

    for (const file of sortedFiles) {
        let filePath = path.join(sourceDir, file);
        await readFile(filePath, writeStream);
        await unlink(filePath); // unlink combined chunk
    }
    writeStream.end();
}

app.use(cors());
app.use(serve(UPLOAD_DIR));
app.use(router.routes()).use(router.allowedMethods());

app.listen(3003, () => {
    console.log("app starting at port 3003");
});
