/**
 * Module dependencies.
 */
var through = require('through')
  , falafel = require('falafel');


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
    
    var output = falafel(data, function(node){
      if (node.type === 'ReturnStatement'){
        var fun = parentFunction(node)
        if (isDefineCall(fun.parent)){
          node.update('module.exports = ' + node.argument.source())
        }
      }
      if (isDefineCall(node)){
        if (isCommonJSWrapper(node)){
          // unwrapp the source
          var src = functionBody(node.arguments[0])
          node.update(src);
        }else if (isDefineCallWithArrayDeps(node)){
          var defs = getDefs(node.arguments[0])
          var factoryFunc = node.arguments[1]
          var defVars = getFuncParams(factoryFunc)
          var body = functionBody(factoryFunc)
          node.update(requiresSection(defs, defVars) +
            body)
        }else if (isDefineCallWithNoDeps(node)){
          var factoryFunc = node.arguments[0]
          if (factoryFunc.type === 'FunctionExpression'){
            node.update(functionBody(factoryFunc))
          }else{
            node.update('module.exports = ' + node.arguments[0].source())
          }
        }else if (isDefineCallWithName(node)){
          var defs = getDefs(node.arguments[1])
          var factoryFunc = node.arguments[2]
          var defVars = getFuncParams(factoryFunc)
          node.update(requiresSection(defs, defVars) +
            functionBody(factoryFunc))
        }
      }
    });

    stream.queue(output);
    stream.queue(null);
    return;
  }
};

function isCommonJSWrapper(node){
  var factoryFunc = node.arguments[0]
  return isDefineCall(node) &&
    factoryFunc.params &&
    factoryFunc.params.length === 3;
}

function isDefineCallWithArrayDeps(node){
  return isDefineCall(node) &&
    node.arguments[0].type === 'ArrayExpression' &&
    node.arguments.length === 2;
}

function isDefineCallWithNoDeps(node){
  return isDefineCall(node) &&
    node.arguments.length === 1;
}

function isDefineCallWithName(node){
  var arg = node.arguments[0]
  return isDefineCall(node) &&
    arg.type === 'Literal' &&
      typeof eval(arg.raw) === 'string'
}

function isDefineCallWithNameValuePair(node){

}

function functionBody(funcNode){
  return funcNode.body.body.map(function(b){
    return b.source();
  }).join('\n')
}

function isDefineCall(node){
  return node.type === 'CallExpression' &&
    node.callee.name === 'define';
}

function parentFunction(node){
  var next = node.parent
  while(next && next.type !== 'FunctionExpression'){
    next = next.parent
  }
  return next
}

function requiresSection(defs, defVars){
  return defVars.map(function(defVar, i){
    if (defs[i]){
      return 'var ' + defVar + ' = require("' + defs[i] + '");'
    }else{
      return 'var ' + defVar
    }
  }).join('\n') + '\n'
}

function getDefs(arg){
  return arg.elements.map(function(s){
    return s.value
  })
}

function getFuncParams(func){
  return func.params.map(function(p){
    return p.name
  })
}

