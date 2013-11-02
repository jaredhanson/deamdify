/**
 * Module dependencies.
 */
var through = require('through')
  , falafel = require('falafel')
  , zip = require('lodash.zip');
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
module.exports = function (file) {
  var data = '';
  
  var stream = through(write, end);
  return stream;
  
  function write(buf) { data += buf }

  function end() {
    
    var seemsToSupportsCommonJS = false
    var commonJSWrapper = false

    var output = falafel(data, function(node){
      if (node.type === 'ReturnStatement'){
        var fun = parentFunction(node)
        if (isDefineCall(fun.parent)){
          node.update('module.exports = ' + node.argument.source())
        }
      }
      if (isCommonJSRequire(node)){
        seemsToSupportsCommonJS = true
      }
      if (isUMDCheck(node)){
        // get rid of the if statement entirely and pull
        // the consequent block up
        node.update(node.consequent.body[0].expression.source())
      }
      if (isDefineCall(node)){

        var args = node.arguments.slice(0)
        var moduleDef
        var deps = []
        var render = renderModuleLiteral

        if (isString(args[0])) args.shift()
        if (isArray(args[0])){
          deps = getDeps(args.shift())
        }
        if (args.length > 0){
          moduleDef = args.shift()
          if (isFunction(moduleDef)){
            render = renderModuleFactory
          }else if (isIdentifier(moduleDef)){
            render = renderModuleIdentifier
          }
        }

        if (isCommonJSWrapper(deps, moduleDef)){
          commonJSWrapper = true;
        }
        node.update(render(deps, moduleDef))
        

      }
    });

    if (seemsToSupportsCommonJS && !commonJSWrapper){
      stream.queue(data);
    }else{
      stream.queue(output);
    }
    stream.queue(null);
    return;
  }
};

function renderModuleFactory(deps, factory){
  var defVars = getFuncParams(factory)
  var reqs = requiresSection(deps, defVars)
  var body = functionBody(factory)
  return reqs + body
}

function renderModuleLiteral(deps, literal){
  var reqs = requiresSection(deps, [])
  return reqs + 'module.exports = ' + literal.source()
}

function requiresSection(deps, depVars){
  var vars = zip(deps, depVars)
  var ret = vars
    .filter(function(vr){
      var dep = vr[0]
      return dep && ['require', 'module', 'exports'].indexOf(dep) === -1
    })
    .map(function(vr){
      var def = vr[0]
      var depVar = vr[1]
      if (def){
        return 'var ' + depVar + ' = require("' + def + '");'
      }else{
        return 'var ' + depVar
      }
    }).join('\n')
  if (ret.length > 0) ret += '\n'
  return ret
}

function renderModuleIdentifier(deps, identifier){
  return ';(function(){\n' +
      deps.map(function(dep, i){
        return '  var $' + i + ' = require("' + dep + '");'
      }).join('\n') + '\n' +
      '  module.exports = ' + identifier.name + '(' + deps.map(function(d, i){ return '$' + i }).join(', ') + ');\n' +
    '}());'
}

function isArray(node){
  return node.type === 'ArrayExpression'
}

function isString(node){
  return node.type === 'Literal' &&
      typeof eval(node.raw) === 'string'
}

function isFunction(node){
  return node.type === 'FunctionExpression'
}

function isIdentifier(node){
  return node.type === 'Identifier'
}

function isDefineCall(node){
  return node.type === 'CallExpression' &&
    node.callee.name === 'define';
}

function functionBody(funcNode){
  return funcNode.body.body.map(function(b){
    return b.source();
  }).join('\n')
}

function parentFunction(node){
  var next = node.parent
  while(next && next.type !== 'FunctionExpression'){
    next = next.parent
  }
  return next
}

function getDeps(arg){
  return arg.elements.map(function(s){
    return s.value
  })
}

function getFuncParams(func){
  return func.params.map(function(p){
    return p.name
  })
}

function isCommonJSRequire(node){
  return node.type === 'CallExpression' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal' &&
    typeof eval(node.arguments[0].raw) === 'string'
}

function isCommonJSWrapper(deps, factory){
  if (!factory || factory.type !== 'FunctionExpression') return false
  var params = factory.params
  return factory && params.length >= 3 &&
    params[0].name === 'require' &&
    params[1].name === 'exports' &&
    params[2].name === 'module'
}

function isUMDCheck(node){
  return node.type === 'IfStatement' &&
    node.test.type === 'LogicalExpression' &&
    isTypeCheck(node.test.left) &&
    isAmdPropertyCheck(node.test.right)

  function isTypeCheck(node){
    return node.type === 'BinaryExpression' &&
      (node.operator === '===' || node.operator === '==') &&
      isTypeof(node.left) &&
      node.right.type === 'Literal' &&
      node.right.value === 'function'
  }

  function isTypeof(node){
    return node.type === 'UnaryExpression' &&
      node.operator === 'typeof' &&
      node.argument.type === 'Identifier' &&
      node.argument.name === 'define'
  }

  function isAmdPropertyCheck(node){
    return node.type === 'MemberExpression' &&
      node.object.name === 'define' &&
      node.property.name === 'amd'
  }
}

