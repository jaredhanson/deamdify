var cart = require('./cart'), inventory = require('./inventory');
var FOO = 'bar';
exports.color = 'blue';
exports.size = 'large';
exports.addToCart = function () {
    inventory.decrement(this);
    cart.add(this);
};