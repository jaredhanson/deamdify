var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing module using a identifier as factory', function() {

  var stream = deamdify('test/data/identifier-as-factory.js')

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should assume factory is a function that returns exports', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/identifier-as-factory.expect.js', 'utf8')
      expect(output).to.be.equal(expected.trim());
      done();
    });

    var file = fs.createReadStream('test/data/identifier-as-factory.js');
    file.pipe(stream);
  });

});
