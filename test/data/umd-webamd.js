var foo = function bar() {}
function factory() {}
if (typeof define === 'function' && define.amd) {
    foo();
    define(factory);
} else {
    root.myModule = factory();
}
