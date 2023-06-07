import express from "express";
import fs from "fs";
const app = express();

app.get("/test", (req, res, next) => {
  res.setHeader("Content-Disposition", 'attachment; filename="test.txt"');
  res.end("pngs");
});

app.listen(3000, () => {
  console.log(`server is running at port 3000`);
});

app.get("/", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // NOTE: this file is only 36k
  // we can try bigger one.
  // @ts-ignore
  res.download("test.png", {
    acceptRanges: true,
  });
});
app.options("/", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Range");
  res.end("");
});

app.get("/length", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end("" + fs.statSync("./test.png").size);
});
