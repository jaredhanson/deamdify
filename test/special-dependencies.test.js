var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe.skip('deamdify\'ing AMD module using special dependencies', function() {
  
  var stream = deamdify('test/data/special-dependencies.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/special-dependencies.expect.js', 'utf8')
      console.error(output)
      expect(output).to.be.equal(expected);
      done();
    });
    
    var file = fs.createReadStream('test/data/special-dependencies.js');
    file.pipe(stream);
  });
  
});
