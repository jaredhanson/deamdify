/**
 * Module dependencies.
 */
var through = require('through')
  , esprima = require('esprima')
  , estraverse = require('estraverse')
  , escodegen = require('escodegen')
  , util = require('util');


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
    var ast = esprima.parse(data)
      , isAMD = false;
    
    //console.log('-- ORIGINAL AST --');
    //console.log(util.inspect(ast, false, null));
    //console.log('------------------');
    
    // TODO: Ensure that define is a free variable.
    // TODO: Implement support for amdWeb UMD modules.
    
    estraverse.replace(ast, {
      leave: function(node) {

        if (isDefine(node) && this.parents().length == 1) {
          isAMD = true;

          var call = node.expression;

          if (call.arguments.length == 1 && call.arguments[0].type == 'FunctionExpression') {
            return createIife(call.arguments[0].body);

          } else if (call.arguments.length == 1 && call.arguments[0].type == 'ObjectExpression') {
            return createModuleExport(call.arguments[0]);

          } else if (call.arguments.length == 2 && call.arguments[0].type == 'ArrayExpression' && call.arguments[1].type == 'FunctionExpression') {
            var dependencies = call.arguments[0]
              , factory = call.arguments[1];
            
            var ids = dependencies.elements.map(function(el) { return el.value });
            var vars = factory.params.map(function(el) { return el.name });
            var reqs = createRequires(ids, vars);
            return createIife(reqs.concat(factory.body.body));

          } else if (call.arguments.length == 3 && call.arguments[0].type == 'Literal' && call.arguments[1].type == 'ArrayExpression' && call.arguments[2].type == 'FunctionExpression') {
            var dependencies = call.arguments[1]
              , factory = call.arguments[2];
            
            var ids = dependencies.elements.map(function(el) { return el.value });
            var vars = factory.params.map(function(el) { return el.name });
            var reqs = createRequires(ids, vars);
            return createIife(reqs.concat(factory.body.body));
          }
        } else if (isReturn(node)) {
          var parents = this.parents();

          if (parents.length == 5 && isDefine(parents[1])) {
            return createModuleExport(node.argument);
          }
        }
      }
    });
    
    stream.queue(isAMD ? escodegen.generate(ast) : data);
    stream.queue(null);
  }
};


function isDefine(node) {
  return node.type == 'ExpressionStatement'
    && node.expression.type == 'CallExpression'
    && node.expression.callee.type == 'Identifier'
    && node.expression.callee.name == 'define'
  ;
}

function isReturn(node) {
  return node.type == 'ReturnStatement';
}

function createRequires(ids, vars) {
  var body = [];
  var declarations = [];

  vars.forEach(function(variable, i) {
    if (/^(require|module|exports)$/.test(ids[i])) return;

    declarations.push({
      type: 'VariableDeclarator',
      id: {type: 'Identifier', name: variable},
      init: ids[i] ? {
        type: 'CallExpression',
        callee: {type: 'Identifier', name: 'require'},
        arguments: [{type: 'Literal', value: ids[i]}]
      } : null
    });
  });

  if (declarations.length) {
    body.push({
      type: 'VariableDeclaration',
      declarations: declarations,
      kind: 'var'
    });
  }

  ids.slice(vars.length).forEach(function(id) {
    body.push(createExpression({
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'require'},
      arguments: [{type: 'Literal', value: id}]
    }));
  });

  return body;
}

function createModuleExport(obj) {
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

function createIife(body) {
  if (Array.isArray(body)) {
    body = {type: 'BlockStatement', body: body};
  }
  return createExpression({
    type: 'CallExpression',
    callee: {
      type: 'FunctionExpression',
      params: [],
      defaults: [],
      body: body
    },
    arguments: []
  });
}

function createExpression(expression) {
  return {type: 'ExpressionStatement', expression: expression};
}
