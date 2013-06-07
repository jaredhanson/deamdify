# deAMDify

This module is a [browserify](http://browserify.org/) plugin that will transform
[AMD](https://github.com/amdjs) modules into [Node.js](http://nodejs.org/)-style
modules so that they can be included in browser-ified bundles.

With this transform in place, Node and AMD modules can be freely intermixed, and
the resulting bundle can be used without the need for a separate loader such as
[RequireJS](http://requirejs.org/).

## Install

    $ npm install deamdify

## Usage

#### Command Line

Bundle up all required modules, including AMD modules, into a single file
using `browserify` with the `deamdify` transform.

    browserify -t deamdify main.js -o bundle.js

#### API

```javascript
var browserify = require('browserify');
var fs = require('fs');

var b = browserify('main.js');
b.transform('deamdify');

b.bundle().pipe(fs.createWriteStream('bundle.js'));
```

## Tests

    $ npm install
    $ make test

[![Build Status](https://secure.travis-ci.org/jaredhanson/deamdify.png)](http://travis-ci.org/jaredhanson/deamdify)  [![David DM](https://david-dm.org/jaredhanson/deamdify.png)](http://david-dm.org/jaredhanson/deamdify)

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Jared Hanson <[http://jaredhanson.net/](http://jaredhanson.net/)>
