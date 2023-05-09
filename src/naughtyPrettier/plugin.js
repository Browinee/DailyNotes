const babelParsers = require("prettier/parser-babel").parsers;
const typescriptParsers = require("prettier/parser-typescript").parsers;

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const _ = require("lodash");

function myPreprocessor(code, options) {
  const ast = parser.parse(code, {
    plugins: ["typescript", "jsx"],
    sourceType: "module",
  });

  const importNodes = [];

  traverse(ast, {
    ImportDeclaration(path) {
      importNodes.push(_.clone(path.node));
      path.remove();
    },
    VariableDeclaration(path) {
      // handle VariableDeclaration nodes
    },
    FunctionDeclaration(path) {
      // handle FunctionDeclaration nodes
    },
  });

  const newImports = _.shuffle(importNodes);

  const newAST = types.file({
    type: "Program",
    body: newImports,
  });

  // NOTE: retainLine
  // function add(a, b) {
  // #line 1
  //   return a + b;
  // #line 2
  // }
  const newCode =  generate(newAST).code +
    "\n" +
    generate(ast, {
      retainLines: true,
    }).code;

  return newCode;
}

module.exports = {
  parsers: {
    babel: {
      ...babelParsers.babel,
      preprocess: myPreprocessor,
    },
    typescript: {
      ...typescriptParsers.typescript,
      preprocess: myPreprocessor,
    },
  },
};