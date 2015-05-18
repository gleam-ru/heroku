/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.connections.html
 */

module.exports.connections = {

    //  ╔╦╗╦ ╦╔═╗╔═╗ ╦
    //  ║║║╚╦╝╚═╗║═╬╗║
    //  ╩ ╩ ╩ ╚═╝╚═╝╚╩═╝
    //
    RgpLocalhostMysqlServer: {
        adapter: 'sails-mysql',
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'sails_db',
    },

    /**
     * TODO:
     * Спросить у дена почему не работает...
     * table doesn`t exist...
     *
     * http://stackoverflow.com/questions/18433124/heroku-and-nodejs-mysql-connection-lost-the-server-closed-the-connection
     * https://github.com/felixge/node-mysql#server-disconnects
     * https://github.com/felixge/node-mysql#error-handling
     *
     * https://github.com/chadn/heroku-sails/blob/master/lib/authenKey.js
     *
     * это все, что я нашел, но все равно не починил :(
     */
    HerokuMysqlServer: {
        adapter: 'sails-mysql',
        // url: 'mysql://be50e30cc6b57b:6675390c@us-cdbr-iron-east-02.cleardb.net:3306/heroku_33fbe7236ec661e?reconnect=true',
        host: 'eu-cdbr-west-01.cleardb.com',
        user: 'b8870163950a00',
        password: 'd7faa67e',
        database: 'heroku_61392df38b4f492',
        // reconnect: true, // а так можно? оО
    },



    //  ╔╦╗╔═╗╔╗╔╔═╗╔═╗
    //  ║║║║ ║║║║║ ╦║ ║
    //  ╩ ╩╚═╝╝╚╝╚═╝╚═╝
    //
    // someMongodbServer: {
    //     adapter: 'sails-mongo',
    //     host: 'localhost',
    //     port: 27017,
    //     // user: 'username',
    //     // password: 'password',
    //     // database: 'your_mongo_db_name_here'
    // },



    //  ╔═╗╔═╗╔═╗╔╦╗╔═╗╦═╗╔═╗
    //  ╠═╝║ ║╚═╗ ║ ║ ╦╠╦╝║╣
    //  ╩  ╚═╝╚═╝ ╩ ╚═╝╩╚═╚═╝
    //
    // somePostgresqlServer: {
    //     adapter: 'sails-postgresql',
    //     host: 'YOUR_POSTGRES_SERVER_HOSTNAME_OR_IP_ADDRESS',
    //     user: 'YOUR_POSTGRES_USER',
    //     password: 'YOUR_POSTGRES_PASSWORD',
    //     database: 'YOUR_POSTGRES_DB'
    // }



    //
    // More adapters: https://github.com/balderdashy/sails
    //

};
