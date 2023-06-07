import puppeteer from "puppeteer";
import os from "os";
import path from "path";
import readline from "readline";
import https from "https";
import fs from "fs";
import sizeOf from "image-size";

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (command) => {
    switch (command) {
      case "upload-next":
        await uploadNext();
        break;
      case "download-img":
        await downloadImg();
        break;
      default:
        break;
    }
  });
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 0,
      height: 0,
    },
    userDataDir: path.join(os.homedir(), ".puppeteer-data"),
  });

  const page = await browser.newPage();

  await page.goto("https://wx.zsxq.com/dweb2/article?groupId=51122858222824");

  let links = [];
  async function downloadImg() {
    links = await page.evaluate(() => {
      let links = [];
      const lines = document.querySelectorAll(".ql-editor p");
      for (let i = 0; i < lines.length; i++) {
        const matchRes = lines[i].textContent
          .trim()
          .match(/!\[[^\[\]\(\)]*\]\(([^\[\]\(\)]*)\)/);
        if (matchRes) {
          links.push({
            index: i,
            link: matchRes && matchRes[1],
          });
        }
      }
      return links;
    });

    const imgPath = path.join(os.homedir(), ".img");

    fs.rmSync(imgPath, {
      recursive: true,
    });
    fs.mkdirSync(imgPath);

    for (let i = 0; i < links.length; i++) {
      const filePath = path.join(imgPath, i + 1 + ".image");
      let currentTotal = 0;
      downloadFile(links[i].link, filePath, (totalBytes, chunkBytes) => {
        currentTotal += chunkBytes;

        if (currentTotal >= totalBytes) {
          setTimeout(() => {
            const { type } = sizeOf(fs.readFileSync(filePath));
            fs.renameSync(filePath, filePath + "." + type);
            console.log(
              `${filePath} 下载完成，重命名为 ${filePath + "." + type}`
            );
          }, 1000);
        }
      });
    }

    console.log(links);
  }

  let cursor = 0;
  async function uploadNext() {
    if (cursor >= links.length) {
      return;
    }
    await page.click(`.ql-editor p:nth-child(${links[cursor].index + 1})`);
    await page.evaluate((index) => {
      const p = document.querySelector(`.ql-editor p:nth-child(${index + 1})`);
      p.textContent = "";
    }, links[cursor].index);
    await page.click(".ql-image");
    cursor++;
  }
  function downloadFile(url, destinationPath, progressCallback) {
    let resolve, reject;
    const promise = new Promise((x, y) => {
      resolve = x;
      reject = y;
    });

    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        const error = new Error(
          `Download failed: server returned code ${response.statusCode}. URL: ${url}`
        );
        response.resume();

        reject(error);
        return;
      }
      const file = fs.createWriteStream(destinationPath);

      file.on("finish", () => resolve());
      file.on("error", (error) => reject(error));

      response.pipe(file);

      const totalBytes = parseInt(response.headers["content-length"], 10);
      if (progressCallback) response.on("data", onData.bind(null, totalBytes));
    });
    request.on("error", (error) => reject(error));
    return promise;

    function onData(totalBytes, chunk) {
      progressCallback(totalBytes, chunk.length);
    }
  }
}
main();
