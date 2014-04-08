var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing a Node module', function() {
  
  var stream = deamdify('test/data/node-module.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should not transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/node-module.js', 'utf8')
      expect(output.trim()).to.be.equal(expected.trim());
      done();
    });
    
    var file = fs.createReadStream('test/data/node-module.js');
    file.pipe(stream);
  });
  
});
