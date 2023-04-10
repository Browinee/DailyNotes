# Multipart Download

This pratice is aimed for using `Range` in http header and `ArrayBuffer` to download and combine a big file in multiple pieces concurrently.

## NOTICE

If we set header like following

```
 headers: {
   Range: 'bytes=0-2,4-5,7-',
}
```

instead of

```
  headers: {
     Range: "bytes=0-",
  }
```

the response content-type will change from `text/plain; charset=UTF-8` to `multipart/byteranges`, which will cause cors error.
Reference:

- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Range
- https://mp.weixin.qq.com/s/J55UtidL_WI0zSJM1C7kXQ
- ArrayBuffer, TypedArray https://ithelp.ithome.com.tw/articles/10246326
