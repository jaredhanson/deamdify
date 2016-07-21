var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing a UMD module using a definition function without CommonJS support', function() {

  var stream = deamdify('test/data/umd-webamd-with-function.js')

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should transform define and preserve closure', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/umd-webamd-with-function.expect.js', 'utf8')
      expect(output).to.be.equal(expected.trim());
      done();
    });

    var file = fs.createReadStream('test/data/umd-webamd-with-function.js');
    file.pipe(stream);
  });

});
