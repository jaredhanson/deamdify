/**
 * Module dependencies.
 */
var through = require('through')
  , esprima = require('esprima')
  , estraverse = require('estraverse')
  , escodegen = require('escodegen')
  , path = require('path')
  , util = require('util')
  , support = require('./support');


/**
 * Transform AMD to CommonJS.
 *
 * This transform translates AMD modules into CommonJS modules.  AMD modules
 * are defined by calling the `define` function that is available as a free
 * or global variable.  The transform translates that call into traditional
 * CommonJS require statements.  Any value returned from the factory function
 * is assigned to `module.exports`.
 *
 * After the transform is complete, Browserify will be able to parse and
 * bundle the module as if it were a Node.js module.
 *
 * @param {String} file
 * @return {Stream}
 * @api public
 */
module.exports = function (file, options) {
  var data = '';
  var ext = path.extname(file);
  options = options || {};

  var stream = through(write, end);
  return stream;

  function write(buf) { data += buf }
  function end() {
    var ast
      , tast
      , isAMD = false
      , isUMD = false
      , supportsCommonJs = false;

    if (ext.toLowerCase() === '.js') {
      try {
        ast = esprima.parse(data)
      } catch (error) {
        throw new Error('Error deamdifying ' + file + ': ' + error);
      }

      //console.log('-- ORIGINAL AST --');
      //console.log(util.inspect(ast, false, null));
      //console.log('------------------');

      // TODO: Ensure that define is a free variable.
      estraverse.replace(ast, {
        enter: function(node) {
          if (isCommonJsCheck(node)) {
            supportsCommonJs = true;
          }
          else if (!supportsCommonJs && isAMDCheck(node)) {
            node.test = { type: 'Literal', value: true, raw: 'true' };
            node.alternate = null;
            isUMD = true;
          }
          else if (isDefine(node) || isAMDRequire(node)) {
            if (isUMD) {
              isAMD = true;
              return;
            }
            var parents = this.parents();

            // Check that this module is an AMD module, as evidenced by invoking
            // `define` or `require([], fn)` at the top-level. Any CommonJS or
            // UMD modules are pass through unmodified.`
            if (parents.length == 2 && parents[0].type == 'Program' && parents[1].type == 'ExpressionStatement') {
              isAMD = true;
            }
          }
        },
        leave: function(node) {
          if (isAMD && (isDefine(node) || isAMDRequire(node))) {
            //define({})
            if (node.arguments.length == 1 &&
                node.arguments[0].type == 'ObjectExpression') {
              // object literal
              var obj = node.arguments[0];

              tast = generateCommonJsModuleForObject(obj);
              this.break();
            } else
            //define(function(){})
            if (node.arguments.length == 1 &&
                node.arguments[0].type == 'FunctionExpression') {
              var dependenciesIds = extractDependencyIdsFromFactory(node.arguments[0]),
                  factory = node.arguments[0];
              tast = generateCommonJsModuleForFactory(dependenciesIds, factory);
              this.break();
            } else
            //define(variableName)
            if (node.arguments.length == 1 &&
                node.arguments[0].type == 'Identifier') {
              // reference
              var obj = node.arguments[0];

              return generateCommonJsModuleForObject(obj).expression;
            } else
            //define([],function(){})
            if (node.arguments.length == 2 &&
                node.arguments[0].type == 'ArrayExpression' &&
                node.arguments[1].type == 'FunctionExpression') {
              var dependenciesIds = extractDependencyIdsFromArrayExpression(node.arguments[0], options.paths)
                , factory = node.arguments[1];

              tast = generateCommonJsModuleForFactory(dependenciesIds, factory);
              this.break();
            } else
            //define("a b c".split(' '), function(){})
            if (node.arguments.length == 2 &&
                node.arguments[0].type == 'CallExpression' &&
                node.arguments[1].type == 'FunctionExpression') {
              try {
                var dependenciesCode = node.arguments[0]
                  , dependenciesIds = extractDependencyIdsFromCallExpression(dependenciesCode, options.paths)
                  , factory = node.arguments[1];

                tast = generateCommonJsModuleForFactory(dependenciesIds, factory);
                this.break();
              } catch(e) {
                console.log("failed to evaluate dependencies:", dependenciesCode, e)
              }
            } else
            //define('modulename',function(){})
            if (node.arguments.length == 2 &&
                node.arguments[0].type == 'Literal' &&
                node.arguments[1].type == 'FunctionExpression') {
              var dependenciesIds = extractDependencyIdsFromFactory(node.arguments[1])
                , factory = node.arguments[1];

              tast = generateCommonJsModuleForFactory(dependenciesIds, factory);
              this.break();
            } else
            //define('modulename', [], function(){})
            if (node.arguments.length == 3 &&
                node.arguments[0].type == 'Literal' &&
                node.arguments[1].type == 'ArrayExpression' &&
                node.arguments[2].type == 'FunctionExpression') {
              var dependenciesIds = extractDependencyIdsFromArrayExpression(node.arguments[1], options.paths)
                , factory = node.arguments[2];

              tast = generateCommonJsModuleForFactory(dependenciesIds, factory);
              this.break();
            } else
            //define('modulename', "a b c".split(' '), function(){})
            if (node.arguments.length == 3 &&
                node.arguments[0].type == 'Literal' &&
                node.arguments[1].type == 'CallExpression' &&
                node.arguments[2].type == 'FunctionExpression') {
              try {
                var dependenciesCode = node.arguments[1]
                  , dependenciesIds = extractDependencyIdsFromCallExpression(dependenciesCode, options.paths)
                  , factory = node.arguments[2];

                tast = generateCommonJsModuleForFactory(dependenciesIds, factory);
                this.break();
              } catch(e) {
                console.log("failed to evaluate dependencies:", dependenciesCode, e)
              }
            }
          }
        }
      });
    }

    if (!isAMD) {
      stream.queue(data);
      stream.queue(null);
      return;
    }

    tast = tast || ast;

    //console.log('-- TRANSFORMED AST --');
    //console.log(util.inspect(tast, false, null));
    //console.log('---------------------');

    var out = escodegen.generate(tast);
    stream.queue(out);
    stream.queue(null);
  }
};

function generateCommonJsModuleForObject(obj) {
  return { type: 'ExpressionStatement',
    expression:
     { type: 'AssignmentExpression',
       operator: '=',
       left:
        { type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'module' },
          property: { type: 'Identifier', name: 'exports' } },
       right: obj } };
}

function extractDependencyIdsFromArrayExpression(dependencies, paths) {
  return dependencies.elements.map(function(el) { return rewriteRequire(el.value, paths); });
}


function extractDependencyIdsFromCallExpression(callExpression, paths) {
  var ids = eval(escodegen.generate(callExpression));
  return ids.map(function(id) { return rewriteRequire(id, paths); });
}

function rewriteRequire(path, paths) {
  var parts = path.split("/");
  var module = parts[0];
  if(paths && module in paths) {
    var rest = parts.slice(1, parts.length);
    var rewrittenModule = paths[module];
    return [rewrittenModule].concat(rest).join("/")
  } else {
    return path;
  }
}

function extractDependencyIdsFromFactory(factory) {
  var parameters = factory.params.map(function(param){
    if(param.type === 'Identifier') {
      return param.name;
    }
  });

  if(isCommonJsWrappingParameters(parameters)) {
    return [];
  } else {
    return commonJsSpecialDependencies.slice(0, parameters.length);
  }
}

function isCommonJsWrappingParameters(parameters) {
  return parameters.length === commonJsSpecialDependencies.length
        && parameters[0] === commonJsSpecialDependencies[0]
        && parameters[1] === commonJsSpecialDependencies[1]
        && parameters[2] === commonJsSpecialDependencies[2];
}

function generateCommonJsModuleForFactory(dependenciesIds, factory) {
  var program,
      exportResult = support.doesFactoryHaveReturn(factory);
  if(dependenciesIds.length === 0 && !exportResult) {
    program = factory.body.body;
  } else {

    var importExpressions = [];

    //build imports
    var imports;
    if(dependenciesIds.length > 0) {
        buildDependencyExpressions(dependenciesIds).forEach(function(expressions){
            importExpressions.push(expressions.importExpression);
        });
    }

    var callFactoryWithImports = {
                "type": "CallExpression",
                "callee": factory,
                "arguments": importExpressions

        };

    var body;
    if(exportResult) {
      //wrap with assignment
      body = {
        "type": "ExpressionStatement",
            "expression":{
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "module"
                },
                "property": {
                    "type": "Identifier",
                    "name": "exports"
                }
            },
            "right": callFactoryWithImports
          }
      };
    } else {
      body = {
              "type": "ExpressionStatement",
              "expression": callFactoryWithImports
          };
    }


    //program
    program = [body];
  }
  return { type: 'Program',
           body: program };
}

//NOTE: this is the order as specified in RequireJS docs; don't changes
var commonJsSpecialDependencies = ['require', 'exports', 'module'];
function commonJsSpecialDependencyExpressionBuilder(dependencyId) {
  if(commonJsSpecialDependencies.indexOf(dependencyId) !== -1) {
    return {importExpression:{
            "type": "Identifier",
            "name": dependencyId
        }
    };
  }
}

function defaultRequireDependencyExpressionBuilder(dependencyId) {
  return {importExpression: {
      "type": "CallExpression",
      "callee": {
          "type": "Identifier",
          "name": "require"
      },
      "arguments": [
          {
              "type": "Literal",
              "value": dependencyId
          }
      ]
  }};
}

function buildDependencyExpressions(dependencyIdList) {
  var dependencyExpressionBuilders = [
    commonJsSpecialDependencyExpressionBuilder,
    defaultRequireDependencyExpressionBuilder
  ];

  return dependencyIdList.map(function(dependencyId){
    return dependencyExpressionBuilders.reduce(function(currentExpression, builder){
        return currentExpression || builder(dependencyId);
    },  null);
  });
}

function buildVariableDeclaration(imports, loader) {
  var declarations = [];
  if (imports) {
    declarations.push(imports);
  }
  declarations.push(loader);

  return {
    "type": "VariableDeclaration",
    "declarations": declarations,
    "kind": "var"
  };
}

function isDefine(node) {
  var callee = node.callee;
  return callee
    && node.type == 'CallExpression'
    && callee.type == 'Identifier'
    && callee.name == 'define'
  ;
}

function isCommonJsCheck(node) {
  if (typeof exports === 'object')
  return node.type === 'IfStatement' &&
    isTypeCheck(node.test);

  function isTypeCheck(node) {
    return node.type === 'BinaryExpression' &&
      (node.operator === '===' || node.operator === '==') &&
      isTypeof(node.left) &&
      node.right.type === 'Literal' &&
      node.right.value === 'object';
  }

  function isTypeof(node) {
    return node.type === 'UnaryExpression' &&
      node.operator === 'typeof' &&
      node.argument.type === 'Identifier' &&
      node.argument.name === 'exports';
  }
}

function isAMDCheck(node) {
  return node.type === 'IfStatement' &&
    node.test.type === 'LogicalExpression' &&
    isTypeCheck(node.test.left) &&
    isAmdPropertyCheck(node.test.right);

  function isTypeCheck(node) {
    return node.type === 'BinaryExpression' &&
      (node.operator === '===' || node.operator === '==') &&
      isTypeof(node.left) &&
      node.right.type === 'Literal' &&
      node.right.value === 'function';
  }

  function isTypeof(node) {
    return node.type === 'UnaryExpression' &&
      node.operator === 'typeof' &&
      node.argument.type === 'Identifier' &&
      node.argument.name === 'define';
  }

  function isAmdPropertyCheck(node) {
    return node.type === 'MemberExpression' &&
      node.object.name === 'define' &&
      node.property.name === 'amd';
  }
}

function isAMDRequire(node) {
  var callee = node.callee;
  return callee
    && node.type == 'CallExpression'
    && callee.type == 'Identifier'
    && callee.name == 'require'
  ;
}
