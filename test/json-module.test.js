var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing a JSON module', function() {

  var filename = 'test/data/json-module.json';
  var stream = deamdify(filename)

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should not transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync(filename, 'utf8')
      expect(output).to.be.equal(expected);
      done();
    });

    var file = fs.createReadStream(filename);
    file.pipe(stream);
  });

});
