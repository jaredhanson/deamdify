# deAMDify

[![Build Status](https://secure.travis-ci.org/jaredhanson/deamdify.png)](http://travis-ci.org/jaredhanson/deamdify) [![David DM](https://david-dm.org/jaredhanson/deamdify.png)](http://david-dm.org/jaredhanson/deamdify)


This module is a [browserify](http://browserify.org/) plugin that will transform
[AMD](https://github.com/amdjs) modules into [Node.js](http://nodejs.org/)-style
modules so that they can be included in browser-ified bundles.

With this transform in place, Node and AMD modules can be freely intermixed, and
the resulting bundle can be used without the need for a separate loader such as
[RequireJS](http://requirejs.org/).

**For when you're stuck and need help:**

[![Join the chat at https://gitter.im/jaredhanson/deamdify](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jaredhanson/deamdify?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Install

```sh
$ npm install deamdify
```

## Usage

#### Command Line

Bundle up all required modules, including AMD modules, into a single file
using `browserify` with the `deamdify` transform.

```sh
browserify -t deamdify main.js -o bundle.js
```

#### API

```javascript
var browserify = require('browserify');
var fs = require('fs');

var b = browserify('main.js');
b.transform('deamdify');

b.bundle().pipe(fs.createWriteStream('bundle.js'));
```

#### package.json

For packages that are written as AMD modules, add a browserify transform field
to `package.json` and browserify will apply the transform to all modules in the
package as it builds a bundle.

```
{
  "name": "anchor",
  "main": "main",
  "browserify": {
    "transform": "deamdify"
  }
}
```

## Tests

```sh
$ npm install
# fast run
$ npm run test-main
# test all browserify major versions
$ npm test
```

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
