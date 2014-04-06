if (typeof define === 'function' && define.amd) {
    foo();
    define(factory);
} else {
    root.myModule = factory();
}
