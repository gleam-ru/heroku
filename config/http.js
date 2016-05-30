/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {

    middleware: {
        passportInit: require('passport').initialize(),
        passportSession : require('passport').session(),
        setLocals : function(req, res, cb) {
            res.locals.user = req.user || {roles: [{name:'ghost'}], isGhost: true};
            res.locals.hasRoles = function(roleNames) {
                var ok = false;
                if (!Array.isArray(roleNames)) {
                    roleNames = [roleNames]
                }
                _.each(roleNames, function(roleName) {
                    if (_.find(res.locals.user.roles, {name: roleName})) {
                        ok = true;
                        return false;
                    }
                })
                return ok;
            }
            cb();
        },

        order: [
            'startRequestTimer',
            'cookieParser',
            'session',

            'passportInit',
            'passportSession',
            'setLocals',

            'myRequestLogger',
            'bodyParser',
            'handleBodyParserError',
            'compress',
            'methodOverride',
            'poweredBy',
            '$custom',
            'router',
            'www',
            'favicon',
            '404',
            '500',
        ],

        // example
        // myRequestLogger: function (req, res, next) {
        //     console.log("Requested :: ", req.method, req.url);
        //     return next();
        // }


        /***************************************************************************
        *                                                                          *
        * The body parser that will handle incoming multipart HTTP requests. By    *
        * default as of v0.10, Sails uses                                          *
        * [skipper](http://github.com/balderdashy/skipper). See                    *
        * http://www.senchalabs.org/connect/multipart.html for other options.      *
        *                                                                          *
        ***************************************************************************/
        // bodyParser: require('skipper')

    },

    /***************************************************************************
    *                                                                          *
    * The number of seconds to cache flat files on disk being served by        *
    * Express static middleware (by default, these files are in `.tmp/public`) *
    *                                                                          *
    * The HTTP static cache is only active in a 'production' environment,      *
    * since that's the only time Express will cache flat-files.                *
    *                                                                          *
    ***************************************************************************/

    cache: 1000*60*60*20 // 20h
};
