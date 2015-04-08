var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing AMD module defining a module using only a name and a factory function', function() {

  var stream = deamdify('test/data/define-module-name-factory.js')

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/define-module-name-factory.expect.js', 'utf8')
      expect(output).to.be.equal(expected);
      done();
    });

    var file = fs.createReadStream('test/data/define-module-name-factory.js');
    file.pipe(stream);
  });

});
