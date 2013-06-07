var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing a UMD module with CommonJS and AMD support', function() {
  
  var stream = deamdify('test/data/umd-commonjs-amd.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should not transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/umd-commonjs-amd.js', 'utf8')
      expect(output).to.be.equal(expected);
      done();
    });
    
    var file = fs.createReadStream('test/data/umd-commonjs-amd.js');
    file.pipe(stream);
  });
  
});
