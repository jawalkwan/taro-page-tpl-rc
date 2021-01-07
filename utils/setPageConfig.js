const vscode = require('vscode');
const fs = require('fs');
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const babelType = require("@babel/types");
const prettier = require("prettier");

module.exports = (path, title, style) => {
  var configFile = path + '/index.config.js';
  fs.readFile(configFile, "utf-8", (err, content) => {
    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: [
        "jsx",
        "flow",
        "json",
      ],
    });
    traverse(ast, {
      enter(path) {
        if (path.node.name === 'navigationBarTitleText') {
          path.parentPath.node.value.value = escape(title);
        }
        if (path.node.name === 'navigationStyle') {
          path.parentPath.node.value.value = style;
        }
      }
    });
    const result = generate(
      ast,
      {
        jsonCompatibleStrings: true,
        retainLines: true,
      },
      content
    );
    prettier.resolveConfig(configFile).then((options) => {
      const formateText = prettier.format(unescape(result.code), {
        parser: 'babel'
      });
      //写入文件
      fs.writeFile(configFile, formateText, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }).catch((err) => {
      console.log(err);
    });
  });
}