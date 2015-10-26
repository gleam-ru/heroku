module.exports.bootstrap = function(cb) {


    // MODULES
    global.Q        = require('q');
    global.moment   = require('moment');
    global.fs       = require('fs-extra');
    global._        = require('lodash');

    // проверить по DD.MM.YYYY перед заменой!!! некоторые сервисы требуют
    // повторной инициализации ddf
    global.ddf = 'DD.MM.YYYY'; // Default Date Format




    if (process.env.I_AM_HEROKU) {
        sails.config.amazon.s3.key    = process.env.AMAZON_S3_KEY;
        sails.config.amazon.s3.secret = process.env.AMAZON_S3_SECRET;
    }


    // создаем нужные директории
    var fs = require('fs-extra');
    if (!fs.existsSync(sails.config.app.dataDir)) {
        fs.mkdirSync(sails.config.app.dataDir);
    }


    // TODO: сделать покрасиввее
    if (!sails.config.heroku) {
        async.series([
            filler.process,
            provider.init,
            cache.init,
            cron.init,
        ],
        function(err) {
            // if (err) return cb(err);
            if (err) {
                console.error('bootstrap:', err, err.message, err.stack);
            }
            // provider.bonds.update();
            // dbTasks.bondsNewDay();
            cb();
        });
        return;
    }
    else {
        cb();
        async.series([
            filler.process,
            provider.init,
            cache.init,
            cron.init,
        ],
        function(err) {
            if (err) {
                console.error('Bootstrap failed', err);
            }
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
            console.log("i'm listening, my master...")
        });
        return;
    }

};







/**
 * Вдруг еще раз понадобятся - чтобы по коммитам/стешам не лазить
 *
 */

//
// Убирает все свечи из бд начиная с lastGoodDate
/*
function(next) {
    Q.resolve()
        .then(function() {
            console.log('share find')
            return Share.find();
        })
        .then(function(shares) {
            console.log('shares found')
            var tasks = [];
            var lastGoodDate = '10.08.2015';
            lastGoodDate = moment(lastGoodDate, ddf);
            _.each(shares, function(share) {
                var task = Q.resolve()
                    .then(function() {
                        var len_1 = share.dailyCandles.length;
                        share.dailyCandles = _.filter(share.dailyCandles, function(candle) {
                            var candleDate = moment(candle.d, ddf);
                            return candleDate < lastGoodDate;
                        })
                        var len_2 = share.dailyCandles.length;
                        if (len_2 < len_1) {
                            console.log('saving: ', share.name, len_1, len_2);
                            return share.save();
                        }
                        else {
                            return Q.resolve();
                        }
                    })
                tasks.push(task);
            })
            console.log('tasks.length', tasks.length)
            return Q.all(tasks);
        })
        .then(function() {
            console.info('bad candles removed')
        })
        .nodeify(next);
}
//*/
