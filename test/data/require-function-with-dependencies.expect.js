module.exports = function (cart, inventory) {
    var FOO = 'bar';
    return {
        color: 'blue',
        size: 'large',
        addToCart: function () {
            inventory.decrement(this);
            cart.add(this);
        }
    };
}(require('./cart'), require('./inventory'));