const request = require("request");
const qs = require("querystring");
const crypto = require("crypto");
const print = require("./print");
const ora = require("ora");
module.exports = function(word, options, callback) {
  const youdao = function(word) {
    const appKey = "7f786ddf3d41918f"; //应用ID
    const salt = new Date().getTime();
    const curTime = Math.round(new Date().getTime() / 1000);
    function getSign(q) {
      const key = "SHuY1zWMRA7SoDryUat91oVGHlfdT6Z4"; //应用密钥
      var len = q.length;
      let input =
        len <= 20 ? q : q.substring(0, 10) + len + q.substring(len - 10, len);
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
        body: reqData
      },
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          try {
            print.youdao(word,JSON.parse(body));
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
      {},
      (error, response, body) => {
        if (!error && response.statusCode == 200) {
          try {
            print.iciba(word,JSON.parse(body));
          } catch (error) {
            console.log("error", error);
          }
        }
        callbackAll();
      }
    );
  };
  console.log(" ");
  const spinner = ora().start();
  let count = 0;
  const callbackAll = () => {
    count++;
    if (count >= 2) {
      spinner.stop();
    }
    callback && callback();
  };
  youdao(word);
  iciba(word);
};
