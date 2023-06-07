const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

function getModuleInfo(file) {
    // read file
    const body = fs.readFileSync(file, "utf-8");

    // transform to ast tree
    const ast = parser.parse(body, {
        sourceType: "module", // meaning we are parsing es module
    });

    // collect dependencies
    const deps = {};
    traverse(ast, {
        ImportDeclaration({ node }) {
            const dirname = path.dirname(file);
            const absolutePath = "./" + path.join(dirname, node.source.value);
            console.log("absolutePath", absolutePath)
            deps[node.source.value] = absolutePath;
        },
    });

    // ES6 -> ES5
    const { code } = babel.transformFromAst(ast, null, {
        presets: ["@babel/preset-env"],
    });
    const moduleInfo = { file, deps, code };
    return moduleInfo;
}

const info = getModuleInfo("./index.ts");
console.log("info:", info);
/*
{
 file: './index.ts',
  deps: { './add.js': './add.js' },
  code: '"use strict";\n' +
    '\n' +
    'var _add = _interopRequireDefault(require("./add.js"));\n' +
    '\n' +
    'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
    '\n' +
    'console.log((0, _add["default"])(1, 2));'
}
 */


/**
 * get dependencies
 * @param {*} temp
 * @param {*} param1
 */
function getDeps(temp, { deps }) {
    Object.keys(deps).forEach((key) => {
        const child = getModuleInfo(deps[key]);
        temp.push(child);
        getDeps(temp, child);
    });
}
/**
 * parse module
 * @param {*} file
 * @returns
 */


function parseModules(file) {
    const entry = getModuleInfo(file);
    const temp = [entry];
    const depsGraph = {};

    getDeps(temp, entry);

    temp.forEach((moduleInfo) => {
        depsGraph[moduleInfo.file] = {
            deps: moduleInfo.deps,
            code: moduleInfo.code,
        };
    });
    return depsGraph;
}


// bundle file
function bundle(file) {
    const depsGraph = JSON.stringify(parseModules(file));
    console.log("depGraph", depsGraph)
    return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`;
}

var content = bundle("./index.ts");
!fs.existsSync("./dist") && fs.mkdirSync("./dist");
fs.writeFileSync("./dist/bundle.js", content);


// reference: https://juejin.cn/post/6961961165656326152