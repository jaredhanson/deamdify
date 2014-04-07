var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing AMD module defining a name-value pair', function() {
  
  var stream = deamdify('test/data/name-value-pair.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/name-value-pair.expect.js', 'utf8')
      expect(output.trim()).to.be.equal(expected.trim());
      done();
    });
    
    var file = fs.createReadStream('test/data/name-value-pair.js');
    file.pipe(stream);
  });
  
});
