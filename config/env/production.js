/**
 * Production environment settings
 * sails.config.environment
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

    heroku: true,

    models: {
        // не работает - читай в connections.js :(
        // connection: 'HerokuMysqlServer',
        //
        connection: 'sailsDisk',
        refill: true,
        drop: false,
        migrate: 'alter',
    },

    port: 5000,

    log: {
        level: "silent",
        custom: require('winston').loggers.get('prod_logger'),
    }

};
