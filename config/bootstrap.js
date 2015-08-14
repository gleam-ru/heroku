/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 */

// просто глобально нужные вещи...
// http://bost.ocks.org/mike/shuffle/
Array.prototype.shuffle = function() {
    var array = this;
    var m = array.length;
    var t;
    var i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}


module.exports.bootstrap = function(cb) {

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
        async.series([
            cache.init,
            s3.serverToClient,
            provider.init,
            cron.init,
            // s3.clientToServer,
        ],
        function(err) {
            if (err) return cb(err);
            console.log("i'm listening, my master...");
            // dbTasks.bondsNewDay();
            // provider.bonds.update();
            cb();
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
