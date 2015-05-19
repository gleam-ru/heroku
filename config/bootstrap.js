/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 */

module.exports.bootstrap = function(cb) {
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
            provider.init,
            cache.init,
            // cron.init,
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
        async.series([
            provider.init,
            cache.init,
            cron.init,
            // TODO: убрать!
            function(next) {
                var timeToNextParsing = cron.tasks.bondsParser.next();
                var now = require('moment')();
                if ((timeToNextParsing - now) > (1000 * 60 * 35)) { // 35 min
                    console.log('force parsing...');
                }
                else {
                    console.log('parsing as usual');
                    next();
                }
            },
        ],
        function(err) {
            if (err) log.error('Bootstrap failed', err);
            console.log("i'm listening, my master...")
            // provider.bonds.update();
            cb();
        });
        return;
    }

};
