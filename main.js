const request = require("request");
const print = require("./print");
const ora = require("ora");
let token = require("./src/getTTK");
const userAgents = require("./data/userAgents");
const md5 = require("md5");
const timeoutOpt = {
  timeout: 10000,
};
function isChinese(word) {
  var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
  return !!patrn.exec(word);
}
module.exports = function (word, options, callback) {
  let funObj = {
    youdao: (word) => {
      let userAgent = userAgents[parseInt(Math.random() * userAgents.length)];
      request.get(
        `http://www.youdao.com/w/${encodeURIComponent(word)}`,
        {
          headers: {
            "User-Agent": userAgent,
          },
          ...timeoutOpt,
        },
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            try {
              print.youdaoHtml(word, body);
            } catch (error) {
              console.log("error", error);
            }
          }
          callbackAll();
        }
      );
    },
    iciba: (word) => {
      let params = {
        client: 6,
        key:1000006,
        timestamp:+new Date,
        word:encodeURIComponent(word)
      }
      function getParams(word){
        let _params = {};
        Object.keys(params).sort().forEach(i => {
          _params[i] = params[i];
        });
        _params = Object.values(_params).join("");
        let signature = "/dictionary/word/query/web" +  _params + "7ece94d9f9c202b0d2ec557dg4r9bc"
        return md5(signature)
      }
      let url = `https://dict.iciba.com/dictionary/word/query/web?client=6&key=1000006&timestamp=${params.timestamp}&word=${encodeURIComponent(params.word)}&signature=${getParams(word)}`
      request.get(
        url,
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
    },
    bing: (word) => {
      request.get(
        `http://cn.bing.com/dict/search?q=${encodeURIComponent(word)}`,
        { ...timeoutOpt },
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            try {
              print.bing(word, body);
            } catch (error) {
              console.log("error", error);
            }
          }
          callbackAll();
        }
      );
    },
    google: (word) => {
      const isCN = isChinese(word);
      const tl = isCN ? "en" : "zh-CN";
      let url = `https://translate.google.cn/translate_a/single?client=webapp&sl=auto&tl=${tl}&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&otf=1&ssel=0&tsel=0&kc=1&hl=zh-CN`;
      token.get(word).then((d) => {
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
    },
  };
  const spinner = ora().start();
  let count = 0;
  let keys = Object.keys(funObj);
  const callbackAll = ()=>{
    count++;
    if(count >= keys.length){
      spinner.stop();
    }
    callback && callback();
  }
  keys.forEach(key=>{
    funObj[key](word);
  })
};
