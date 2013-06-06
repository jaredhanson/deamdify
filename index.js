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
    
    console.log('-- ORIGINAL AST --');
    console.log(util.inspect(ast, false, null));
    console.log('------------------');
    
    // TODO: Ensure that define is a top-level function call.
    
    estraverse.traverse(ast, {
      leave: function(node) {
        if (isDefine(node)) {
          if (node.arguments.length == 1 && node.arguments[0].type == 'FunctionExpression') {
            var fn = node.arguments[0];
            
            // simplified CommonJS wrapper
            if (fn.params.length == 3 && fn.params[0].name == 'require'
                                      && fn.params[1].name == 'exports'
                                      && fn.params[2].name == 'module') {
              tast = createProgram(fn.body.body);
              this.break();
            }
          } else if (node.arguments.length == 1 && node.arguments[0].type == 'ObjectExpression') {
            // object literal
            var obj = node.arguments[0];
            
            tast = createObjectExport(obj);
            this.break();
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
  return { type: 'Program',
    body: body };
}

function createObjectExport(obj) {
  return { type: 'Program',
    body: 
     [ { type: 'ExpressionStatement',
         expression: 
          { type: 'AssignmentExpression',
            operator: '=',
            left: 
             { type: 'MemberExpression',
               computed: false,
               object: { type: 'Identifier', name: 'module' },
               property: { type: 'Identifier', name: 'exports' } },
            right: obj } } ] };
}
