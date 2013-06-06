var through = require('through')
  , esprima = require('esprima')
  , estraverse = require('estraverse')
  , escodegen = require('escodegen')
  , util = require('util');


module.exports = function (file) {
  var data = '';
  
  var stream = through(write, end);
  return stream;
  
  function write(buf) { data += buf }
  function end() {
    var ast = esprima.parse(data)
      , tast;
    
    //console.log('-- ORIGINAL AST --');
    //console.log(util.inspect(ast, false, null));
    //console.log('------------------');
    
    estraverse.traverse(ast, {
      leave: function(node) {
        if (isDefine(node)) {
          if (node.arguments.length == 1 && node.arguments[0].type == 'FunctionExpression') {
            var fn = node.arguments[0];
            
            // Simplified CommonJS Wrapper
            if (fn.params.length == 3 && fn.params[0].name == 'require'
                                      && fn.params[1].name == 'exports'
                                      && fn.params[2].name == 'module') {
              tast = createProgram(fn.body.body);
              this.break();
            }
          }
        }
      }
    });
    
    tast = tast || ast;
    
    //console.log('-- TRANSFORMED AST --');
    //console.log(util.inspect(tast, false, null));
    //console.log('---------------------');
    
    var out = escodegen.generate(tast);
    stream.queue(out);
    stream.queue(null);
  }
};


function isDefine(node) {
  var callee = node.callee;
  return callee
    && node.type == 'CallExpression'
    && callee.type == 'Identifier'
    && callee.name == 'define'
  ;
}

function createProgram(body) {
  return {
    type: 'Program',
    body: body
  };
}
