var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing AMD module that has a name', function() {
  
  var stream = deamdify('test/data/module-with-a-name.js')
  
  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });
  
  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/module-with-a-name.expect.js', 'utf8')
      fs.writeFileSync('test/data/module-with-a-name.actual.js', output)
      expect(output).to.be.equal(expected);
      done();
    });
    
    var file = fs.createReadStream('test/data/module-with-a-name.js');
    file.pipe(stream);
  });
  
});
