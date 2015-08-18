module.exports.bootstrap = function(cb) {


    // MODULES
    global.Q        = require('q');
    global.moment   = require('moment');
    global.fs       = require('fs-extra');




    if (process.env.I_AM_HEROKU) {
        sails.config.amazon.s3.key    = process.env.AMAZON_S3_KEY;
        sails.config.amazon.s3.secret = process.env.AMAZON_S3_SECRET;
    }


    // создаем нужные директории
    var fs = require('fs-extra');
    if (!fs.existsSync(sails.config.app.dataDir)) {
        fs.mkdirSync(sails.config.app.dataDir);
    }

    // чтобы не проверять при каждом создании
    Statistics.findOrCreate({
        name: 'bondsUpdatedAt',
    }, {
        name: 'bondsUpdatedAt',
    }, function(){});


    // Заполняем модель тестовыми данными
    // /*
    User.create({
        id: 1,
        username: 'admin',
        email: "admin@host.org",
        access: "admin",
    }, function(){});
    Passport.create({
        id: 1,
        user: 1,
        strategy: 'local',
        password: 'Xa@Bk1rU',
    }, function(){});
    //*/


    // TODO: сделать покрасиввее
    if (!sails.config.heroku) {
        cb();
        async.series([
            // cache.init,
            // s3.serverToClient,
            provider.init,
            // cron.init,
            // s3.clientToServer,
        ],
        function(err) {
            // if (err) return cb(err);
            if (err) {
                console.error('bootstrap:', err, err.message, err.stack);
            }
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            // provider.bonds.update();
            // dbTasks.bondsNewDay();
        });
        return;
    }
    else {
        cb();
        async.series([
            cache.init,
            s3.serverToClient,
            provider.init,
            cron.init,
        ],
        function(err) {
            if (err) log.error('Bootstrap failed', err);
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
        });
        return;
    }

};
