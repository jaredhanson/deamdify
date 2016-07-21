var foo;
factory();
if (typeof define === 'function' && define.amd) {
    define(function () { return foo; });
} else {
    root.myModule = foo;
}
function factory() {
    foo = {};
}
