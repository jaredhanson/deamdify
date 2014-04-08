before();
(function () {
    var beta = require('beta');
    exports.verb = function () {
        return require('beta').verb();
    };
}());
after();
