if (typeof define === 'function' && define.amd) {
    define(factory);
} else {
    root.myModule = factory();
}