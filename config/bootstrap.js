/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 */

module.exports.bootstrap = function(cb) {
    // TODO: сделать покрасиввее
    var localhost = !sails.config.environment.heroku;
    if (localhost) {
        provider.init(function(err) {
            if (err) {
                log.error('Provider init failed', err);
            }
            // provider.bonds.update();

            // первоначальное заполнение кэша
            cache.init();
            // установка тасков
            // cron.init();
        });
    }
    else {
        async.series([
            function(asyncCb) {
                provider.init(asyncCb);
            },
            function(asyncCb) {
                cache.init();
                asyncCb();
            },
            function(asyncCb) {
                cron.init();
                asyncCb();
            },
        ], function(err) {
            if (err) {
                log.error('Provider init failed', err);
            }
        });
    }

    // TODO: убрать это убожество -_-
    if (sails.config.models.drop) {
        require('fs-extra').removeSync('sailsDisk')
    }

    // Заполняем модель тестовыми данными
    // /*
    if (sails.config.models.refill) {
        User.create({
            id: 1,
            username: 'admin',
            email: "admin@host.org",
            access: "admin",
        }, function(err, user) {
            if (err) return;
            console.log(user.toJSON());
            Passport.create({
                id: 1,
                protocol: 'local',
                password: 'Xa@Bk1rU',
                user: user.id,
            }, function(err, passport) {
                if (err) return;
                console.log(passport.toJSON);
            });
        })
    }
    //*/
    //
    console.log("i'm listening, my master...")

    cb();
};
