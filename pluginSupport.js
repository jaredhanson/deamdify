function isPlugin(dependencyId) {
  return dependencyId.indexOf('!') !== -1;
}

function generateVariableNameForModule(dependencyId) {
  return "m_" + dependencyId.replace(/[\/-]/g,"_").replace(/\./g,"");
}


/* Used within VariableDeclaration
 * example: var $moduleName = require($dependencyId),
 *              $paramName;
 */
function buildModuleAndParamaterDeclaration(moduleName, dependencyId, paramName) {
return {
      "type": "VariableDeclaration",
      "declarations": [{
          "type": "VariableDeclarator",
          "id": {
              "type": "Identifier",
              "name": moduleName
          },
          "init": {
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
          }
      }, {
          "type": "VariableDeclarator",
          "id": {
              "type": "Identifier",
              "name": paramName
          },
          "init": null
      }],
      "kind": "var"
  };
}

/*
 * example: var $paramName;
 */
function buildParameterDeclaration(paramName) {
  return {
        "type": "VariableDeclaration",
        "declarations": [{
            "type": "VariableDeclarator",
            "id": {
                "type": "Identifier",
                "name": paramName
            },
            "init": null
        }],
        "kind": "var"
    };
}

/* This block of code will call load on the module with the plugin parameter
 * and capture the result via callback.
 * example: $moduleName.load($pluginParameter, function () {
 *            }, function (r) {
 *                 $paramName = r;
 *            });
 */
function buildPluginExpression(moduleName, pluginParameter, paramName) {
  return {
      "type": "ExpressionStatement",
      "expression": {
          "type": "CallExpression",
          "callee": {
              "type": "MemberExpression",
              "computed": false,
              "object": {
                  "type": "Identifier",
                  "name": moduleName
              },
              "property": {
                  "type": "Identifier",
                  "name": "load"
              }
          },
          "arguments": [
              {
                  "type": "Literal",
                  "value": pluginParameter
              },
              {
                  "type": "FunctionExpression",
                  "id": null,
                  "params": [],
                  "defaults": [],
                  "body": {
                      "type": "BlockStatement",
                      "body": []
                  },
                  "rest": null,
                  "generator": false,
                  "expression": false
              },
              {
                  "type": "FunctionExpression",
                  "id": null,
                  "params": [
                      {
                          "type": "Identifier",
                          "name": "r"
                      }
                  ],
                  "defaults": [],
                  "body": {
                      "type": "BlockStatement",
                      "body": [
                          {
                              "type": "ExpressionStatement",
                              "expression": {
                                  "type": "AssignmentExpression",
                                  "operator": "=",
                                  "left": {
                                      "type": "Identifier",
                                      "name": paramName
                                  },
                                  "right": {
                                      "type": "Identifier",
                                      "name": "r"
                                  }
                              }
                          }
                      ]
                  },
                  "rest": null,
                  "generator": false,
                  "expression": false
              }
          ]
      }
  };
}


/*
 * example: $paramName
 */
function buildParameterExpression(paramName) {
  return {
      "type": "Identifier",
      "name": paramName
  };
}

function createPluginDependencyExpressionBuilder() {
  var pluginValueCounter = 0,
      modules = {};


  return function pluginDependencyExpressionBuilder(pluginRequireString) {
    if(isPlugin(pluginRequireString)) {

      var parts = pluginRequireString.split("!", 2),
          dependencyId = parts[0],
          pluginParameter = parts[1],
          moduleName=  generateVariableNameForModule(dependencyId),
          paramName = 'pluginValue' + pluginValueCounter++,
          importModule = !modules[moduleName];
        modules[moduleName] = true;
        return {
          preImportExpressions: [
            importModule ? buildModuleAndParamaterDeclaration(moduleName, dependencyId, paramName)
                         : buildParameterDeclaration(paramName),
            buildPluginExpression(moduleName, pluginParameter, paramName)],
          importExpression: buildParameterExpression(paramName)
        };
    }
  };
}

module.exports = createPluginDependencyExpressionBuilder;
