before();
(function () {
    var cart = require('my/cart'), inventory = require('my/inventory');
    module.exports = function (title) {
        return title ? window.title = title : inventory.storeName + ' ' + cart.name;
    };
}());
after();
