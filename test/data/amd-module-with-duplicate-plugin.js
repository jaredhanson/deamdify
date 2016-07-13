define("foo/title",
        ["my/cart", "./my/plug-in!paramname1", "./my/plug-in!paramname2"],
        function(cart, paramvalue1, paramvalue2) {
            function Foo() {return paramvalue1 + paramvalue2}
            return Foo;
       }
    );
