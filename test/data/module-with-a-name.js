before();
define("foo/title",
        ["my/cart", "my/inventory"],
        function(cart, inventory) {
            function Foo() {}
            return Foo;
       }
    );
after();
