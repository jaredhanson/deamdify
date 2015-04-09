var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe("deamdify'ing a module that looks like UMD but isn't", function() {

  var stream = deamdify('test/data/lookalike.js')

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should remove the if statement', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/lookalike.js', 'utf8')
      expect(output).to.be.equal(expected);
      done();
    });

    var file = fs.createReadStream('test/data/lookalike.js');
    file.pipe(stream);
  });

});
