module.exports = function (require) {
    var foo = require('foo');
    return { bar: {} };
}(require);