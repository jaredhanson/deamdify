var foo;
if (true) {
    module.exports = function () {
        var foo = 'good';
        evil();
        return foo;
    }();
}
function evil() {
    foo = 'evil';
}
