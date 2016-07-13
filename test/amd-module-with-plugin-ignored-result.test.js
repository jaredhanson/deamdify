var deamdify = require('../')
  , fs = require('fs')
  , Stream = require('stream');


describe('deamdify\'ing AMD module with plugin where result is ignored', function() {

  var stream = deamdify('test/data/amd-module-with-plugin-ignored-result.js',
                        {extensions: ['deamdify-amd-plugins']})

  it('should return a stream', function() {
    expect(stream).to.be.an.instanceOf(Stream);
  });

  it('should transform module', function(done) {
    var output = '';
    stream.on('data', function(buf) {
      output += buf;
    });
    stream.on('end', function() {
      var expected = fs.readFileSync('test/data/amd-module-with-plugin-ignored-result.expect.js', 'utf8')
      expect(output).to.be.equal(expected);
      done();
    });

    var file = fs.createReadStream('test/data/amd-module-with-plugin-ignored-result.js');
    file.pipe(stream);
  });

});
