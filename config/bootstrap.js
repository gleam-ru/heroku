/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 */

// TODO:
// убрать это убожество... -_-
var drop_db = false;
if (drop_db) {
    console.log('nedb droppped');
    require('fs-extra').removeSync('sailsDisk/*');
}


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
    var localhost = !sails.config.heroku;
    if (localhost) {
        provider.init(function(err) {
            if (err) {
                log.error('Provider init failed', err);
            }
            // dbTasks.bondsNewDay();
            // provider.bonds.update();

            // первоначальное заполнение кэша
            cache.init();
            // установка тасков
            cron.init();
        });
    }
    else {
        async.series([
            function(asyncCb) {
                provider.init(asyncCb);
            },
            function(asyncCb) {
                cron.init();
                asyncCb();
            },
            function(asyncCb) {
                cache.init();
                asyncCb();
            },
        ], function(err) {
            if (err) {
                log.error('Provider init failed', err);
            }
            // TODO: убрать!
            provider.bonds.update(function() {
                console.log(cron.tasks.bondsParser.next(50));
            });
        });
    }

    console.log("i'm listening, my master...")

    cb();
};
