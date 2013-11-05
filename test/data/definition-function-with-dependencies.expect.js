;(function(){
//my/shirt.js now has some dependencies, a cart and inventory
//module in the same directory as shirt.js
var cart = require("./cart");
var inventory = require("./inventory");
var FOO = "bar";
module.exports = {
            color: "blue",
            size: "large",
            addToCart: function() {
                inventory.decrement(this);
                cart.add(this);
            }
        };
}.call(window));