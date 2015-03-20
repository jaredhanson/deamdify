var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing AMD module using a definition function with dependencies', function() {
  
  var stream = deamdify('test/data/definition-function-with-dependencies.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/definition-function-with-dependencies.expect.js', 'utf8')
      expect(output).to.be.equal(expected);
      done();
    });
    
    var file = fs.createReadStream('test/data/definition-function-with-dependencies.js');
    file.pipe(stream);
  });
  
});
