var m__my_plug_in = require('./my/plug-in'), pluginValue0;
m__my_plug_in.load('paramname1', function () {
}, function (r) {
    pluginValue0 = r;
});
var pluginValue1;
m__my_plug_in.load('paramname2', function () {
}, function (r) {
    pluginValue1 = r;
});
module.exports = function (cart, paramvalue1, paramvalue2) {
    function Foo() {
        return paramvalue1 + paramvalue2;
    }
    return Foo;
}(require('my/cart'), pluginValue0, pluginValue1);