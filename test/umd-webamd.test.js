var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing a UMD module with only AMD support', function() {
  
  var stream = deamdify('test/data/umd-webamd.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/umd-webamd.expect.js', 'utf8')
      fs.writeFileSync('test/data/umd-webamd.actual.js', output)
      expect(output).to.be.equal(expected);
      done();
    });
    
    var file = fs.createReadStream('test/data/umd-webamd.js');
    file.pipe(stream);
  });
  
});
