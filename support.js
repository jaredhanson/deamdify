var estraverse = require('estraverse')

function doesFactoryHaveReturn(factory) {
  var returnFound = false;
  estraverse.traverse(factory.body, {
    enter: function (node, parent) {
        if (returnFound) {
          this.break();
        }

        if (node.type == 'FunctionExpression' ||
            node.type == 'FunctionDeclaration') {
              this.skip();
        }

        if (node.type == 'ReturnStatement') {
              returnFound = true;
              this.break();
        }
    }
  });

  return returnFound;
}

module.exports = {
  doesFactoryHaveReturn: doesFactoryHaveReturn
};
