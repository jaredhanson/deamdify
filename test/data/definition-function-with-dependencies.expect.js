before();
(function () {
    var cart = require('./cart'), inventory = require('./inventory');
    var FOO = 'bar';
    module.exports = {
        color: 'blue',
        size: 'large',
        addToCart: function () {
            inventory.decrement(this);
            cart.add(this);
        }
    };
}());
after();
