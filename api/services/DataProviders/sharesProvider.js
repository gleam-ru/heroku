// var moment = require('moment');
// var parser = require('./bondsParser.js');
var importer = require('./sharesImporter.js');
var me = {};
var type = sails.config.app.providers.shares.type;
var cacheKey = sails.config.app.providers.shares.cache;

// установка дефолтных значений
me.init = function(cb) {
    async.series([
        // кидаю в базу данные из файлов (если в бд их нет)
        importer.process,
        // кэширую все
        me.createCache,
        // получение из базы
        // me.updateCurrent,
        // получение из парса
        // me.update,
    ], cb);
}

// TODO: может жрать много оперативки
// (не течет, просто жрет)
// cb(err, res)
me.createCache = function(cb) {

    Issuer.find({
        type: type,
    }, function(err, shares) {
        if (err) return cb(err);
        var cached = {};

        _.each(shares, function(issuer) {
            var store = issuer.getStore();
            cached[issuer.path] = {
                id: issuer.id,
                general: store.general,
                candles: store.dailyCandles,
                lastCandle: store.lastCandle,
            }
        });
        cache.set(cacheKey, cached);
        cb(null, cached);
    });
}

me.get = function(ticker, cb) {
    var cached = cache.get(cacheKey);
    var data = cached ? cached[ticker] : undefined;
    if (typeof cb !== 'function') {
        // нет колбека. Ну нет, так нет. Возвращаю то, что есть.
        return data;
    }
    if (cached && data) {
        return cb(null, data);
    }
    else if (!cached) {
        console.warn('Кэш запрошен, но не создан.');
    }
    else if (!data) {
        console.warn('Запрошен эмитент, которого нет в кэше:', ticker);
    }
    else {
        console.warn('ЯННП');
    }

    // а запрошенный тикер вообще есть?
    Issuer.count({
        type: type,
        path: ticker,
    }, function(err, count) {
        if (err) return cb(err);
        if (count < 1) {
            console.warn('А кто-то урл-ами балуется... запрошен несуществующий тикер:', ticker);
            return cb(null, {});
        }
        console.info('Обновляю кэш не по расписанию!!!');
        me.createCache(function(err, cached) {
            if (err) return cb(err);
            data = cached ? cached[ticker] : undefined;
            if (!data) {
                console.error('Что-то пошло сильно не так...', 'v0x9cv80xc09');
            }
            return cb(null, data);
        });
    });
}

module.exports = me;
