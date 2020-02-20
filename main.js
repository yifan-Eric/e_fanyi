const request = require("request");
const qs = require("querystring");
const crypto = require("crypto");
const cheerio = require("cheerio");
const print = require("./print");
const ora = require("ora");
const fs = require("fs");
let token = require("./src/getTTK");
const timeoutOpt = {
  timeout: 10000
};
function isChinese(word) {
  var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
  return !!patrn.exec(word);
}

module.exports = function(word, options, callback) {
  const youdao = function(word) {
    const appKey = "7f786ddf3d41918f"; //应用ID
    const salt = new Date().getTime();
    const curTime = Math.round(new Date().getTime() / 1000);
    function getSign(q) {
      const key = "SHuY1zWMRA7SoDryUat91oVGHlfdT6Z4"; //应用密钥
      var len = q.length;
      let input = len <= 20 ? q : q.substring(0, 10) + len + q.substring(len - 10, len);
      let text = appKey + input + salt + curTime + key;
      let d = crypto
        .createHash("sha256")
        .update(text)
        .digest("hex");
      return d;
    }
    const reqData = qs.stringify({
      q: word,
      appKey,
      salt,
      from: "auto",
      to: "auto",
      sign: getSign(word),
      signType: "v3",
      curtime: curTime
    });
    request.post(
      "http://openapi.youdao.com/api",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: reqData,
        ...timeoutOpt
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          try {
            print.youdao(word, JSON.parse(body));
          } catch (error) {
            console.log("error", error);
          }
        }
        callbackAll();
      }
    );
  };
  const iciba = function(word) {
    request.get(
      `http://www.iciba.com/index.php?c=search&a=getWordMean&word=${encodeURIComponent(word)}`,
      { ...timeoutOpt },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          try {
            print.iciba(word, JSON.parse(body));
          } catch (error) {
            console.log("error", error);
          }
        }
        callbackAll();
      }
    );
  };
  const bing = function(word) {
    request.get(
      `http://cn.bing.com/dict/search?q=${encodeURIComponent(word)}`,
      { ...timeoutOpt },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          try {
            print.bing(word, body);
            fs.w
          } catch (error) {
            console.log("error", error);
          }
        }
        callbackAll();
      }
    );
  };
  const google = function(word) {
    const isCN = isChinese(word);
    const tl = isCN ? "en" : "zh-CN";
    let url = `https://translate.google.cn/translate_a/single?client=webapp&sl=auto&tl=${tl}&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&otf=1&ssel=0&tsel=0&kc=1&hl=zh-CN`;
    token.get(word).then(d => {
      url = url + d + "&q=" + decodeURIComponent(word);
      request(url, { ...timeoutOpt }, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          try {
            print.google(word, JSON.parse(body));
          } catch (error) {
            console.log("error", error);
          }
        }
        callbackAll();
      });
    });
  };
  const spinner = ora().start();
  let count = 0;
  const callbackAll = () => {
    count++;
    if (count >= 4) {
      spinner.stop();
    }
    callback && callback();
  };

  google(word);
  youdao(word);
  iciba(word);
  bing(word);
};
