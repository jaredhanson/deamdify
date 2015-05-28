//my/shirt.js now has some dependencies, a cart and inventory
//module in the same directory as shirt.js
require(["./cart", "./inventory"], function(cart, inventory) {
        var FOO = "bar";

        //return an object to define the "my/shirt" module.
        return {
            color: "blue",
            size: "large",
            addToCart: function() {
                inventory.decrement(this);
                cart.add(this);
            }
        };
    }
);
