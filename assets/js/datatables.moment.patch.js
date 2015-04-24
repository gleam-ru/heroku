(function($) {
    $.fn.dataTable.moment = function ( format, locale ) {
        var types = $.fn.dataTable.ext.type;
        // Add type detection
        types.detect.unshift( function ( d ) {
            // Null and empty values are acceptable
            if ( d === '' || d === null ) {
                return 'moment-'+format;
            }

            return moment( d.replace ? d.replace(/<.*?>/g, '') : d, format, locale, true ).isValid() ?
                'moment-'+format :
                null;
        } );

        // Add sorting method - use an integer for the sorting
        types.order[ 'moment-'+format+'-pre' ] = function ( d ) {
            return d === '' || d === null ?
                -Infinity :
                parseInt( moment( d.replace ? d.replace(/<.*?>/g, '') : d, format, locale, true ).format( 'x' ), 10 );
        };
    };
}(jQuery));
