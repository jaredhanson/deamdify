//my/shirt.js now has some dependencies, a cart and inventory
//module in the same directory as shirt.js
require(["./cart", "./inventory"], function(cart, inventory) {
        var FOO = "bar";

        exports.color = "blue";
        exports.size = "large";
        exports.addToCart = function() {
            inventory.decrement(this);
            cart.add(this);
        };
    }
);
