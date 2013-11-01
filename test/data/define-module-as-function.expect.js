var cart = require("my/cart");
var inventory = require("my/inventory");
module.exports = function(title) {
            return title ? (window.title = title) :
                   inventory.storeName + ' ' + cart.name;
        };