var deamdify = require('deamdify')
var fs = require('fs')
var async = require('async')
var diff = require('diff')
var colors = require('colors')

function test(filename, done){

var stream = deamdify('tests/' + filename + '/input.js')

var output = '';
stream.on('data', function(buf) {
  output += buf;
});
stream.on('end', function() {
  var expected
  try{
    expected = '' + fs.readFileSync('tests/' + filename + '/expect.js', 'utf8')
  }catch(e){
    expected = output
  }
  fs.writeFileSync('tests/' + filename + '/actual.js', output)
  if (output !== expected){
    console.error('not ok', filename)
    console.error()
    var res = diff.diffChars(expected, output)
    res.forEach(function(part){
      var color = part.added ? 'green' :
        part.removed ? 'red' : 'grey'
      process.stderr.write(part.value[color])
    })
    console.error()
    done(new Error('not ok ' + filename))
  }else{
    console.log('ok', filename)
    done()
  }
});

var file = fs.createReadStream('tests/' + filename + '/input.js');
file.pipe(stream);

}

fs.readdir('tests', function(err, files){
  files = files.filter(function(name){
    return name.charAt(0) !== '.'
  })
  async.eachSeries(files, test, function(err){
    if (err) process.exit(1)
  })
})