var later = require("later");

var cron = {};
cron.tasks = {};

cron.add = function(name, pattern, foo) {
    var s = later.parse.cron(pattern);
    var schedule = {
        s: s,
        timer: later.setInterval(foo, s),
        go: function() {
            foo();
        },
        stop: function() {
            this.timer.clear();
        },
        next: function(count) {
            return later.schedule(this.s).next(count);
        },
    }
    cron.tasks[name] = schedule;

    return schedule;
}

cron.init = function(cb) {
    // UTC TIME!!!
    // http://www.corntab.com/pages/crontab-gui
    cron.add('bondsParser', '45 5,6,7,8,9,10,11,12,13,14,15,16 * * 1,2,3,4,5', function() {
        provider.bonds
            .hardUpdate()
            .catch(function(err) {
                console.error('error while parsing bonds by cron');
                console.error(err)
            });
    });

    // пакование парса облигаций в дейли свечи
    // в 3:00 каждый пн,вт,ср,чт,пт
    cron.add('bondsNewDay', '0 3 * * 1,2,3,4,5', function() {
        console.log('Напиши наконец-то', 'bondsNewDay');
    });




    // обновление inday свечей
    cron.add('sharesInday', '25,55 5,6,7,8,9,10,11,12,13,14,15,16 * * 1,2,3,4,5', function() {
        provider.shares
            .updateIndayCandles()
            .catch(function(err) {
                console.error('sharesInday cron error');
                console.error(err, err.stack)
            });
    });

    // получение недостающих свечей
    // в 22:00 каждый пн,вт,ср,чт,пт
    cron.add('sharesNewDay', '0 22 * * 1,2,3,4,5', function() {
        var importer = require('./DataProviders/sharesImporter.js');
        importer.fixMissedCandles()
            .catch(function(err) {
                console.error('cron new day error', err);
            })
    });

    // получение данных от гугла
    // каждый час, каждый пн,вт,ср,чт,пт
    cron.add('sharesGoogle', '9 * * * 1,2,3,4,5', function() {
        var importer = require('./DataProviders/sharesImporter.js');
        provider.sharesGoogle.saveToDB()
            .catch(function(err) {
                console.error('cron sharesGoogle error', err);
            })
            ;
    });

    // получение данных от гугла
    // 03:07 в субботу
    cron.add('sharesDivsTotal', '21 3 * * 5', function() {
        var divsParser = require('./DataProviders/sharesDivsParser.js');

        return Q()
            .then(function() {
                return Share.find({
                    where: {
                        dead: false,
                    },
                    select: [
                        'code',
                    ],
                })
                ;
            })
            .then(function(shares) {
                if (!shares) {
                    throw new Error('shares not found');
                }
                return divsParser.parse(_.cMap(shares, 'code'));
            })
            .then(function() {
                return Statistics
                    .findOrCreate({
                        name: 'sharesDivsUpdatedAt',
                    }, {
                        name: 'sharesDivsUpdatedAt',
                    })
                    .then(function(stat) {
                        stat.data = new Date();
                        return stat.save();
                    })
                    ;
            })
            .catch(function(err) {
                console.error('cron sharesDivsTotal error', err);
            })
            ;
    });

    // дропаю ремемберми токены раз в неделю
    // 02:01 в субботу
    cron.add('dropRememberMes', '1 2 * * 7', function() {
        return Q()
            .then(function() {
                return Passport.destroy({
                    strategy: 'rememberme',
                    createdAt: {'<': moment().add(-1, 'month').toDate()},
                });
            })
            .then(function(destroyed) {
                console.debug('destroyed', destroyed);
            })
            .catch(function(err) {
                console.error('cron dropRememberMes error', err);
            })
            ;
    });

    console.log('cron inited');
    if (cb) cb();
}

module.exports = cron;
