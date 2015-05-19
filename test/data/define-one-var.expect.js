module.exports = function (thing) {
    return { thing: thing.hi };
}(require('thing'), require('some-thing'));