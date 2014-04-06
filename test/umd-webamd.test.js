var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing a UMD module without CommonJS support', function() {

  var stream = deamdify('test/data/umd-webamd.js')

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should remove the if statement', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/umd-webamd.expect.js', 'utf8')
      expect(output).to.be.equal(expected.trim());
      done();
    });

    var file = fs.createReadStream('test/data/umd-webamd.js');
    file.pipe(stream);
  });

});
