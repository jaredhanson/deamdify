var m__my_plug_in = require('./my/plug-in'), pluginValue0;
m__my_plug_in.load('paramname', function () {
}, function (r) {
    pluginValue0 = r;
});
module.exports = function (cart) {
    function Foo() {
        return paramvalue;
    }
    return Foo;
}(require('my/cart'), pluginValue0);