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
        console.log('Напиши наконец-то', 'bondsNewDay')
        // async.series([
        //     dbTasks.bondsNewDay,
        //     s3.clientToServer,
        // ], function() {
        //     if (err) {
        //         console.error('cron new day error', err);
        //     }
        // });
    });

    // получение недостающих свечей
    // в 22:00 каждый пн,вт,ср,чт,пт
    cron.add('sharesNewDay', '0 22 * * 1,2,3,4,5', function() {
        var importer = require('./sharesImporter.js');
        importer.fixMissedCandles()
            .catch(function(err) {
                console.error('cron new day error', err);
            })
    });

    console.log('cron inited');
    if (cb) cb();
}

module.exports = cron;
