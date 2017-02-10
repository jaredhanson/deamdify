var foo;
if (typeof define === 'function' && define.amd) {
    define(function () {
        var foo = 'good';
        evil();
        return foo;
    });
} else {
    root.myModule = foo;
}
function evil() {
    foo = 'evil';
}
