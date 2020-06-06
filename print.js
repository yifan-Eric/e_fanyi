const chalk = require("chalk");
const cheerio = require("cheerio");
const log = console.log;
function sameLog(list) {
  list.forEach(item => {
    log(chalk.green(item.key) + " -> " + chalk.blueBright(item.value));
  });
}
function symbolLog(list, func, exchange) {
  list.forEach(i => {
    log(chalk.gray("~ "), chalk.yellow(func(i)));
  });
  if (exchange && exchange.length) {
    let str = chalk.gray("~ ");
    exchange.forEach(i => {
      str += " " + chalk.cyanBright(i.name) + chalk.blueBright(i.value);
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

exports.youdaoHtml = function(word, data) {
  fromLog(word, "youdao.com");
  let $ = cheerio.load(data);
  let symbolList = [];
  let symbolEl = $("#results-contents #phrsListTab .trans-container >ul li");
  if (symbolEl[0]) {
    symbolEl.each((index, el) => {
      symbolList.push($(el).text());
    });
  }
  let exchangeList = [];
  let exchangeEl = $("#results-contents #phrsListTab .trans-container .additional");
  if (exchangeEl[0]) {
    let text = $(exchangeEl[0])
      .text()
      .replace(/[\n\r\[\]]/g, "");
    text = text.split(" ").filter(i => i);
    text.forEach((i, index) => {
      if (index % 2 == 0) {
        exchangeList.push({ name: i + " ", value: text[index + 1] });
      }
    });
  }
  let sameAnalysis = [];
  let sameAnalysisEl = $("#synonyms > ul");
  if (sameAnalysisEl[0]) {
    let el = sameAnalysisEl[0];
    let liList = $("li", el)
      .map((i, _el) => $(_el).text())
      .get();
    let pList = $(".wordGroup", el)
      .map((i, _el) => {
        return $("span", _el)
          .map((i, sEl) =>
            $(sEl)
              .text()
              .replace(/[\n\r\t]| {3,}/g, "")
          )
          .get()
          .join("");
      })
      .get();
    sameAnalysis = liList.map((item, index) => ({ key: item, value: pList[index] }));
  }
  let sentenceList = [];
  let sentenceEl = $("#results-contents #bilingual >ul>li");
  if (sentenceEl[0]) {
    sentenceEl.each((index, el) => {
      let en = $($("p:nth-child(1)", el)[0])
        .text()
        .replace(/[\n\r\t]| {3,}/g, "");
      let cn = $($("p:nth-child(2)", el)[0])
        .text()
        .replace(/[\n\r\t]| {3,}/g, "");
      sentenceList.push({ en, cn });
    });
  }
  symbolLog(symbolList, i => i, exchangeList);
  if (sameAnalysis && sameAnalysis.length) {
    log();
    sameLog(sameAnalysis);
  }
  if (sentenceList && sentenceList.length) {
    sentenceLog(sentenceList, "en", "cn", word);
  }
  splitLine();
};

exports.iciba = function(word, data) {
  fromLog(word, "iciba.com");
  let message = data.message || {};
  const baesInfo = message.baesInfo || {};
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
  if (message.sameAnalysis) {
    log();
    let list = message.sameAnalysis.map(item => ({
      key: item.part_name.match(/(?<=\").*?(?=\")/),
      value: item.word_list
    }));
    sameLog(list);
  }
  let sentence = message.new_sentence && message.new_sentence[0].sentences || [];
  sentenceLog(sentence, "en", "cn", word);
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
