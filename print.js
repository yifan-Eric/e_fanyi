const chalk = require("chalk");
const log = console.log;

exports.youdao = function(word,data) {
  // log();
  log(chalk.magenta(word) + chalk.cyan("   ~~~  youdao.com"));

  // explains
  if (data.basic && data.basic.explains) {
    log();
    data.basic.explains.forEach(i => {
      log(chalk.gray("~ ") + chalk.yellow(i));
    });
  }

  //web
  if (data.web && data.web.length) {
    log();
    data.web.forEach((item, i) => {
      log(chalk.gray(i + 1 + ".") + highlight(item.key, word));
      log("  " + chalk.blueBright(item.value.join(",")));
    });
  }
  log();
  log(chalk.gray(' -------- '));
};

exports.iciba = function(word,data) {
  // log();
  const baesInfo = data.baesInfo;
  log(chalk.magenta(word) + chalk.cyan("  ~~~  iciba.com"));
  //symbol
  if (baesInfo.symbols) {
    log();
    baesInfo.symbols[0].parts.forEach(i => {
      log(chalk.gray("~ ") + chalk.yellow(i.part + i.means.join(" ")));
    });
  }
  if (data.sameAnalysis) {
    log();
    data.sameAnalysis.forEach((item, i) => {
      log(chalk.gray(i + 1 + ".") + chalk.green(item.part_name));
      log("  " + chalk.blueBright(item.word_list));
    });
  }
  if (data.sentence && data.sentence.length) {
    log();
    data.sentence.forEach((item, i) => {
      log(chalk.gray(i + 1 + ".") + highlight(item.Network_en, word));
      log("  " + chalk.keyword("orange")(item.Network_cn));
    });
  }
  log();
  log(chalk.gray(' -------- '));
};
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
