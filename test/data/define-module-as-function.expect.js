module.exports = function (cart, inventory) {
    return function (title) {
        return title ? window.title = title : inventory.storeName + ' ' + cart.name;
    };
}(require('my/cart'), require('my/inventory'));