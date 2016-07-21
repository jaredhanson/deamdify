var foo;
factory();
if (true) {
    module.exports = function () {
        return foo;
    }();
}
function factory() {
    foo = {};
}
