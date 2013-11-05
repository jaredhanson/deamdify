if (typeof define === 'function' && define.amd) {
    blah();
    define(factory);
} else {
    root.myModule = factory();
}