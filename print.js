const chalk = require("chalk");
const cheerio = require("cheerio");
const log = console.log;
function symbolLog(list, func, exchange) {
  list.forEach(i => {
    log(chalk.gray("~ "), chalk.yellow(func(i)));
  });
  if (exchange && exchange.length) {
    let str = chalk.gray("~ ");
    exchange.forEach(i => {
      str += " " + chalk.green(i.name) + chalk.blue(i.value);
    });
    log(str);
  }
}

function sentenceLog(list, keyEn, keyCn, word) {
  if (list && list.length) {
    log();
    if (list.length > 3) list.length = 3;
    list.forEach((item, i) => {
      log(chalk.gray(i + 1 + ".") + highlight(item[keyEn], word));
      log("  " + chalk.keyword("orange")(item[keyCn]));
    });
  }
}

function highlight(string, key, defaultColor) {
  defaultColor = defaultColor || "gray";
  string = string.replace(
    new RegExp("(.*)(" + key + ")(.*)", "gi"),
    "$1$2" + chalk[defaultColor]("$3")
  );
  return string.replace(
    new RegExp("(.*?)(" + key + ")", "gi"),
    chalk[defaultColor]("$1") + chalk.yellow("$2")
  );
}

function fromLog(word, where) {
  log(chalk.magenta(word) + chalk.cyan("   ~~~  " + where));
}
function splitLine() {
  log();
  log(chalk.gray(" ----- 我是一条分割线 --------- "));
}

exports.youdao = function(word, data) {
  fromLog(word, "youdao.com");
  // symbol
  if (data.basic && data.basic.explains) {
    symbolLog(data.basic.explains, i => i);
  }

  //web
  if (data.web && data.web.length) {
    log();
    data.web.forEach((item, i) => {
      let str =
        chalk.gray(i + 1 + ".") +
        highlight(item.key, word) +
        "   " +
        chalk.blueBright(item.value.join(","));
      log(str);
    });
  }
  splitLine();
};

exports.iciba = function(word, data) {
  fromLog(word, "iciba.com");
  const baesInfo = data.baesInfo;
  //symbol
  if (baesInfo.symbols) {
    let exchangeList = [];
    if (baesInfo.exchange) {
      let _data = baesInfo.exchange;
      exchangeList = Object.keys(_data)
        .filter(i => _data[i].length > 0)
        .map(i => ({
          name: i.replace("word_", "."),
          value: " " + _data[i].join(",")
        }));
    }
    symbolLog(baesInfo.symbols[0].parts, i => i.part + i.means.join(" "), exchangeList);
  }
  if (data.sameAnalysis) {
    log();
    data.sameAnalysis.forEach((item, i) => {
      log(
        chalk.green(item.part_name.match(/(?<=\").*?(?=\")/)) + " -> " + chalk.blueBright(item.word_list)
      );
    });
  }
  sentenceLog(data.sentence, "Network_en", "Network_cn", word);
  splitLine();
};

exports.bing = function(word, data) {
  let $ = cheerio.load(data);
  let symbolList = [];
  let symbolEl = $("div.lf_area .qdef>ul");
  if (symbolEl[0]) {
    symbolEl[0].children.forEach(i => {
      let label = $(".pos", i).text();
      let value = [];
      $(".def", i)[0].children.forEach(i => value.push($(i).text()));
      symbolList.push({ label, value: value.join("") });
    });
  }
  let changeBaseEl = $("div.lf_area .hd_div1 .hd_if");
  let changeBaseList = [];
  if (changeBaseEl[0]) {
    changeBaseEl[0].children.forEach(i => {
      if (i.name == "span") {
        changeBaseList.push({
          name: $(i).text(),
          value: $(i)
            .next()
            .text()
        });
      }
    });
  }
  let sentenceList = [];
  let sentenceEl = $("#sentenceSeg .se_li .se_li1");
  if (sentenceEl[0]) {
    sentenceEl.each((i, e) => {
      let en = $(".sen_en", $(e))[0]
        .children.map(i => $(i).text())
        .join("");
      let cn = $(".sen_cn", $(e))[0]
        .children.map(i => $(i).text())
        .join("");
      sentenceList.push({ en, cn });
    });
  }
  fromLog(word, "bing.com");
  symbolLog(symbolList, i => i.label + " " + i.value, changeBaseList);
  if (sentenceList && sentenceList.length) {
    sentenceLog(sentenceList, "en", "cn", word);
  }
  splitLine();
};

exports.google = function(word, data) {
  fromLog(word, "translate.google.cn");
  if (data[0]) {
    let item = data[0][0];
    log();
    log("" + chalk.yellow(item[0]) + chalk.gray("<---->") + chalk.yellow(item[1]));
    log();
  }
  if (data[1]) {
    data[1].forEach(item => {
      log(chalk.gray("--- ") + chalk.keyword("orange")(item[0]) + chalk.gray(" --------"));
      let list = item[2];
      if (list.length > 4) list.length = 4;
      list.forEach(_d => {
        log(chalk.green(_d[0]) + " -> " + chalk.blueBright(_d[1].join(" ")));
      });
    });
  }

  splitLine();
};
