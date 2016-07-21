( function( factory ) {
	if ( typeof define === "function" && define.amd ) {
		define( [ "jquery", "./version" ], factory );
	} else {
		factory( jQuery );
	}
}( function( $ ) {

return $.widget;

} ) );
