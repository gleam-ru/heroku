module.exports.bootstrap = function(cb) {


    // MODULES
    global.isDev    = false;
    global.moment   = require('moment');
    global.fs       = require('fs-extra');
    global._        = require('lodash');
    global.Q        = require('q');
    global.Q.series = function(list) {
        var done = Q();
        var results = [];
        _.each(list, function(fn) {
            done = done.then(function() {
                return fn();
            })
            results.push(done)
        })
        return Q.all(results);
    };

    // lodash
    _.mixin({
        // compactMap
        cMap : function(arr, foo) {
            return _.compact(_.map(arr, foo));
        }
    });

    // проверить по DD.MM.YYYY перед заменой!!! некоторые сервисы требуют
    // повторной инициализации ddf
    global.ddf = 'DD.MM.YYYY'; // Default Date Format

    global.appRoot = __dirname+'/..';


    // TODO: сделать покрасиввее
    if (!sails.config.heroku) {
        isDev = true;
        async.series([
            migrations,
            // filler.process,
            provider.init,
            cache.init,
            // cron.init,
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
            migrations,
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
},
//*/



//
// Добавление всем пользователям роли "пользователь"
/*
function(next) {
    var data = {};
    Q.resolve()
        .then(function() {
            return Role.findOne({name: 'user'})
        })
        .then(function(role) {
            data.role = role;
            console.log('user find')
            return User.find();
        })
        .then(function(users) {
            console.log('users found')
            var tasks = [];
            _.each(users, function(user) {
                tasks.push(Q.resolve()
                    .then(function() {
                        if (!_.find(user.roles, {name: data.role.name})) {
                            user.roles.add(data.role.id);
                            return user.save();
                        }
                        else {
                            return user;
                        }
                    })
                );
            })
            console.log('tasks.length', tasks.length)
            return Q.all(tasks);
        })
        .then(function() {
            console.info('roles updtd')
        })
        .nodeify(next);
},
//*/
