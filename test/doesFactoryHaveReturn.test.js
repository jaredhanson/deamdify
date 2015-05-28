var deamdifySupport = require('../support'),
    fs = require('fs'),
    esprima = require('esprima');


describe('doesFactoryHaveReturn()', function() {

  function extractTopLevelFunctions(ast) {
    var functions = {};

    ast.body.forEach(function(functionDeclaration){
      functions[functionDeclaration.id.name] = functionDeclaration;
    });

    return functions;
  }

  var fileAst = esprima.parse(
                  fs.readFileSync(
                    'test/data/functions-for-doesFactoryHaveReturnTests.js')),
      functions = extractTopLevelFunctions(fileAst);


  var testInputs = [
    ['noop', false],
    ['fnWithOnlyReturn', true],
    ['fnWithNoReturnAndInnerFnWithReturn', false],
    ['fnWithReturnAndInnerFnWithNoReturn', true],
    ['fnWithReturnWithinIfBlock', true],
    ['fnWithNoReturnWithinIfBlock', false],
    ['fnWithReturnWithinWhileBlock', true],
    ['fnWithNoReturnWithinWhileBlock', false],
    ['fnWithReturnDeepWithinIfBlocks', true],
  ];

  testInputs.forEach(function(parameters) {
    var fnName = parameters[0],
        expectedResult = parameters[1],
        testName = [fnName,
                    'should',
                    expectedResult ? 'have': 'have no',
                    'return'].join(' ');

    it(testName, function() {
      var result = deamdifySupport.doesFactoryHaveReturn(functions[fnName]);
      expect(result).to.equal(expectedResult);
    });
  }); 

});
