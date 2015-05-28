(function (require, exports, module, beta) {
    exports.verb = function () {
        return require('beta').verb();
    };
}(require, exports, module, require('beta')));