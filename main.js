const request = require("request");
const print = require("./print");
const ora = require("ora");
let token = require("./src/getTTK");
const userAgents = require("./data/userAgents");

const timeoutOpt = {
  timeout: 10000
};
function isChinese(word) {
  var patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
  return !!patrn.exec(word);
}
module.exports = function(word, options, callback) {
  const youdao = function(word) {
    let userAgent = userAgents[parseInt(Math.random() * userAgents.length)];
    request.get(
      `http://www.youdao.com/w/${encodeURIComponent(word)}`,
      {
        headers: {
          "User-Agent": userAgent
        },
        ...timeoutOpt
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
