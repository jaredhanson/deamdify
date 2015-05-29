define("foo/title",
        ["my/cart", "./my/plug-in!paramname"],
        function(cart, paramvalue) {
            function Foo() {return paramvalue}
            return Foo;
       }
    );
