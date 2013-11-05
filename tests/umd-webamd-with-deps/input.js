if (typeof define === 'function' && define.amd) {
    define(['jquery', 'underscore'], factory);
} else {
    root.myModule = factory(window.jQuery);
}