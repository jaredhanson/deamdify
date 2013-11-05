;(function(){
blah();
;(function(){

if (typeof factory === "function"){
  module.exports = factory();
}else{
  module.exports = factory;
}
}());;
}.call(window));