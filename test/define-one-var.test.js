var deamdify = require('deamdify')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing an AMD module with 1 variable for 2 modules', function() {

  var stream = deamdify('test/data/define-one-var.js');

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/define-one-var.expect.js', 'utf8');
      expect(output).to.be.equal(expected);
      done();
    });

    var file = fs.createReadStream('test/data/define-one-var.js');
    file.pipe(stream);
  });

});
